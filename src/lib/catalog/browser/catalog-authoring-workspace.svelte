<script lang="ts">
  import { tick } from 'svelte';

  import { beforeNavigate, goto } from '$app/navigation';

  import Button from '$lib/holocene/button.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Modal from '$lib/holocene/modal.svelte';
  import TabButtonList from '$lib/holocene/tabs-primitive/tab-button-list.svelte';
  import TabPanels from '$lib/holocene/tabs-primitive/tab-panels.svelte';
  import Tabs from '$lib/holocene/tabs-primitive/tabs.svelte';

  import type {
    CatalogAuthoringHost,
    CatalogPromotionOutcome,
    CatalogPromotionPreview,
  } from './catalog-authoring-host';
  import type { CatalogAuthoringStore } from './catalog-authoring-store';
  import { createCatalogAuthoringStore } from './catalog-authoring-store';
  import {
    catalogPromotionUnavailableReasonLabel,
    catalogSaveOutcomePresentation,
    catalogSaveStateLabel,
    catalogSaveStepLabel,
  } from './catalog-save-presentation';

  interface Props {
    exampleHref?: string;
    host: CatalogAuthoringHost;
    store: CatalogAuthoringStore;
  }

  let { exampleHref, host, store }: Props = $props();
  const paths = $derived($store.files.map(({ path }) => path));
  let addFileOpen = $state(false);
  let filePath = $state('');
  let fileError = $state('');
  let leaveWarningOpen = $state(false);
  let pendingDestination = $state('');
  let pendingFocus: HTMLElement | null = null;
  let recoveryInspection = $state('');
  let outcomeActionButton = $state<{ focus: () => void }>();
  let focusedTerminalSequence = 0;
  let promoteButton = $state<{ focus: () => void }>();
  let promotionConfirming = $state(false);
  let promotionLoading = $state(false);
  let promotionOutcome = $state<CatalogPromotionOutcome>();
  let promotionPreview = $state<CatalogPromotionPreview>();
  let resumingNavigation = false;
  const promotionAvailable = $derived(
    !$store.dirty && $store.terminal?.outcome.status === 'succeeded',
  );
  const promotionUnavailableReason = $derived.by(() => {
    const outcome = $store.terminal?.outcome;
    if (outcome?.status === 'refused' && outcome.reason === 'stale-revision') {
      return 'saved-revision-stale' as const;
    }
    if (outcome && outcome.status !== 'succeeded') {
      return 'save-failed' as const;
    }
    return 'unsaved-changes' as const;
  });
  const outcomePresentation = $derived(
    $store.terminal
      ? catalogSaveOutcomePresentation($store.terminal.outcome)
      : undefined,
  );
  const generatedOutputs = $derived.by(() => {
    const outcome = $store.terminal?.outcome;
    return outcome?.status === 'succeeded' ? outcome.generatedOutputs : [];
  });
  const trackedGeneratedOutputs = $derived(
    generatedOutputs.filter(({ gitEffect }) => gitEffect === 'tracked-update'),
  );
  const ignoredGeneratedOutputs = $derived(
    generatedOutputs.filter(({ gitEffect }) => gitEffect === 'ignored-update'),
  );
  const promotionChangedPaths = $derived.by(() => {
    const outcome = promotionOutcome;
    const preview = promotionPreview;
    if (outcome?.status !== 'succeeded' || preview?.status !== 'available') {
      return [];
    }
    return outcome.result.changedPaths.map((path) => {
      if (path === outcome.result.moved.from) {
        return { effect: 'Ignored local directory removed', path };
      }
      if (path === outcome.result.moved.to) {
        return { effect: 'Tracked directory added', path };
      }
      const output = preview.generatedOutputs.find(
        (candidate) => candidate.path === path,
      );
      return {
        effect:
          output?.gitEffect === 'ignored-update'
            ? 'Ignored local file updated'
            : output?.gitEffect === 'tracked-update'
              ? 'Tracked file updated'
              : 'Git effect unavailable',
        path,
      };
    });
  });

  $effect(() => {
    const terminal = $store.terminal;
    if (
      !terminal ||
      terminal.outcome.status === 'succeeded' ||
      terminal.sequence === focusedTerminalSequence
    ) {
      return;
    }
    focusedTerminalSequence = terminal.sequence;
    void tick().then(() => outcomeActionButton?.focus());
  });

  const addFile = () => {
    fileError = '';
    const result = store.addFile(filePath.trim());
    if (result.status === 'refused') {
      fileError = result.reason;
      return;
    }
    filePath = '';
    addFileOpen = false;
  };

  const restoreNavigationFocus = () => {
    void tick().then(() => pendingFocus?.focus());
  };

  const continueNavigation = () => {
    const destination = pendingDestination;
    leaveWarningOpen = false;
    resumingNavigation = true;
    void goto(destination).finally(() => {
      resumingNavigation = false;
    });
  };

  const save = () => {
    const started = store.beginSave(crypto.randomUUID());
    if (started.status === 'refused') return;
    void host
      .save(started.request, store.acceptSaveEvent)
      .then(store.acceptSaveEvent);
  };

  const reloadFiles = async () => {
    store = createCatalogAuthoringStore(await host.load($store.exampleId));
  };

  const inspectRecovery = async () => {
    const operationId = $store.operationId;
    if (!operationId) return;
    const inspection = await host.inspectSaveOperation(operationId);
    recoveryInspection = inspection
      ? `Recovery operation is ${inspection.status}.`
      : 'No recovery operation record is available.';
  };

  const previewPromotion = async () => {
    if (!promotionAvailable) return;
    promotionLoading = true;
    try {
      promotionOutcome = undefined;
      promotionPreview = await host.previewPromote({
        exampleId: $store.exampleId,
        saveState: { status: 'saved', durability: 'durable' },
      });
    } finally {
      promotionLoading = false;
    }
  };

  const confirmPromotion = async () => {
    if (promotionPreview?.status !== 'available' || !promotionAvailable) return;
    promotionConfirming = true;
    try {
      promotionOutcome = await host.confirmPromote({
        exampleId: $store.exampleId,
        revision: promotionPreview.revision,
        saveState: { status: 'saved', durability: 'durable' },
      });
      if (
        promotionOutcome.status === 'refused' &&
        promotionOutcome.reason === 'stale-preview'
      ) {
        promotionPreview = undefined;
      }
    } finally {
      promotionConfirming = false;
    }
  };

  const closePromotionPreview = () => {
    promotionPreview = undefined;
    void tick().then(() => promoteButton?.focus());
  };

  const handleWindowKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || promotionPreview?.status !== 'available') {
      return;
    }
    event.preventDefault();
    closePromotionPreview();
  };

  beforeNavigate((navigation) => {
    if (resumingNavigation) return;
    if (!$store.dirty && $store.terminal?.outcome.status === 'succeeded') {
      return;
    }
    if (navigation.willUnload) {
      navigation.cancel();
      return;
    }
    if (!navigation.to?.url) return;
    navigation.cancel();
    pendingDestination = `${navigation.to.url.pathname}${navigation.to.url.search}${navigation.to.url.hash}`;
    pendingFocus = document.activeElement as HTMLElement | null;
    leaveWarningOpen = true;
  });
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<section class="min-w-0" aria-label="Catalog authoring files">
  {#if $store.progress.length}
    <section
      class="mb-4 rounded-sm border border-subtle p-4"
      aria-label="Save progress"
      aria-live="polite"
    >
      <h2 class="mb-2 text-lg">Save progress</h2>
      <ol class="space-y-2">
        {#each $store.progress as event (event.sequence)}
          <li
            class="flex flex-wrap items-baseline justify-between gap-2 text-sm"
          >
            <span>{catalogSaveStepLabel(event.step)}</span>
            <strong>{catalogSaveStateLabel(event.state)}</strong>
            {#if event.reason}
              <span class="basis-full text-secondary">{event.reason}</span>
            {/if}
          </li>
        {/each}
      </ol>
    </section>
  {/if}
  {#if outcomePresentation}
    <section
      class="mb-4 rounded-sm border border-subtle p-4"
      role={outcomePresentation.kind === 'failure' ? 'alert' : 'status'}
    >
      <h2 class="text-lg">{outcomePresentation.title}</h2>
      <p class="mt-1 text-sm text-secondary">{outcomePresentation.detail}</p>
      {#if outcomePresentation.kind === 'success'}
        {#if trackedGeneratedOutputs.length}
          <section class="mt-3" aria-label="Tracked generated outputs">
            <h3 class="font-medium">
              Tracked files updated ({trackedGeneratedOutputs.length})
            </h3>
            <ul class="list-disc pl-5 text-sm">
              {#each trackedGeneratedOutputs as output (output.path)}
                <li>{output.path}</li>
              {/each}
            </ul>
          </section>
        {/if}
        {#if ignoredGeneratedOutputs.length}
          <section class="mt-3" aria-label="Ignored generated outputs">
            <h3 class="font-medium">
              Ignored local files updated ({ignoredGeneratedOutputs.length})
            </h3>
            <ul class="list-disc pl-5 text-sm">
              {#each ignoredGeneratedOutputs as output (output.path)}
                <li>{output.path}</li>
              {/each}
            </ul>
          </section>
        {/if}
        <div class="mt-3 flex flex-wrap gap-2">
          {#if exampleHref}
            <Button href={exampleHref} size="sm">Run example</Button>
          {/if}
          <Button size="sm" variant="ghost">Keep editing</Button>
        </div>
      {:else if outcomePresentation.action}
        <Button
          bind:this={outcomeActionButton}
          class="mt-3"
          size="sm"
          variant="secondary"
          onclick={outcomePresentation.action === 'Retry Save'
            ? save
            : outcomePresentation.action === 'Reload files'
              ? reloadFiles
              : inspectRecovery}
        >
          {outcomePresentation.action}
        </Button>
        {#if recoveryInspection}
          <p class="mt-2 text-sm text-secondary" role="status">
            {recoveryInspection}
          </p>
        {/if}
      {/if}
    </section>
  {/if}
  <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
    <p class="text-sm text-secondary" role="status" aria-live="polite">
      {$store.dirty ? 'Unsaved changes' : 'No unsaved changes'}
    </p>
    <Button
      size="sm"
      variant="secondary"
      onclick={() => (addFileOpen = !addFileOpen)}
    >
      Add file
    </Button>
  </div>
  {#if addFileOpen}
    <form
      class="mb-3 flex max-w-xl items-end gap-2"
      aria-label="Add file"
      onsubmit={(event) => {
        event.preventDefault();
        addFile();
      }}
    >
      <Input
        id="catalog-file-path"
        label="File path"
        bind:value={filePath}
        placeholder="notes.md"
        class="grow"
        required
      />
      <Button type="submit" size="sm">Add</Button>
    </form>
    {#if fileError}
      <p class="mb-3 text-sm text-danger" role="alert">{fileError}</p>
    {/if}
  {/if}
  <Tabs
    tabs={paths}
    selectedTab={$store.selectedPath}
    onSelectedTabChange={store.selectFile}
  >
    <TabButtonList
      aria-label="Example files"
      class="flex min-w-0 overflow-x-auto border-b border-subtle bg-code-block"
    >
      {#snippet tabButtonSnippet(getTabButtonProps, { isSelected, tab })}
        <button
          {...getTabButtonProps({
            class: `border-b-2 px-4 py-3 text-sm ${
              isSelected
                ? 'border-brand text-primary'
                : 'border-transparent text-secondary'
            }`,
          })}
        >
          {tab}
        </button>
      {/snippet}
    </TabButtonList>

    <TabPanels>
      {#snippet tabPanelSnippet(getTabPanelProps, { tab })}
        {@const file = $store.files.find(({ path }) => path === tab)}
        <div {...getTabPanelProps({ class: 'min-h-96' })}>
          {#if file}
            <div
              class="flex items-center justify-between gap-2 border-b border-subtle p-2"
            >
              {#if file.removed}
                <p class="text-sm text-secondary">
                  {file.path} is marked for removal
                </p>
                <Button
                  size="xs"
                  variant="secondary"
                  onclick={() => store.restoreFile(file.path)}
                >
                  Restore
                </Button>
              {:else}
                <span></span>
                <Button
                  size="xs"
                  variant="ghost"
                  onclick={() => store.removeFile(file.path)}
                >
                  Mark for removal
                </Button>
              {/if}
            </div>
            <CodeBlock
              content={file.content}
              language={file.path.endsWith('.ts') ? 'typescript' : 'text'}
              editable={file.editable && !file.removed}
              copyable={false}
              label={`Edit ${file.path}`}
              minHeight={384}
              onchange={(content) => store.editFile(file.path, content)}
            />
          {/if}
        </div>
      {/snippet}
    </TabPanels>
  </Tabs>
  <section
    class="mt-4 rounded-sm border border-subtle p-4"
    aria-label="Promote example"
  >
    <div class="flex flex-wrap items-center gap-3">
      <Button
        bind:this={promoteButton}
        size="sm"
        variant="secondary"
        disabled={!promotionAvailable}
        loading={promotionLoading}
        onclick={previewPromotion}
      >
        Promote
      </Button>
      {#if !promotionAvailable}
        <p class="text-sm text-secondary">
          {catalogPromotionUnavailableReasonLabel(promotionUnavailableReason)}
        </p>
      {/if}
    </div>
    {#if promotionPreview?.status === 'unavailable'}
      <p class="mt-3 text-sm" role="status">
        {catalogPromotionUnavailableReasonLabel(promotionPreview.reason)}
      </p>
    {:else if promotionPreview?.status === 'available'}
      <div class="mt-4 space-y-3" aria-label="Promotion preview">
        <h2 class="text-lg">Promotion preview</h2>
        <dl class="grid gap-2 text-sm sm:grid-cols-[max-content_1fr]">
          <dt class="font-medium">Source</dt>
          <dd>{promotionPreview.source.path}</dd>
          <dt class="font-medium">Destination</dt>
          <dd>{promotionPreview.destination.path}</dd>
          <dt class="font-medium">Authored source</dt>
          <dd>{promotionPreview.authoredSource}</dd>
          <dt class="font-medium">Source Git effect</dt>
          <dd>{promotionPreview.gitEffects.source}</dd>
          <dt class="font-medium">Destination Git effect</dt>
          <dd>{promotionPreview.gitEffects.destination}</dd>
        </dl>
        {#if promotionPreview.generatedOutputs.length}
          <h3 class="font-medium">Generated outputs</h3>
          <ul class="list-disc pl-5 text-sm">
            {#each promotionPreview.generatedOutputs as output (output.path)}
              <li>{output.path} — {output.gitEffect}</li>
            {/each}
          </ul>
        {/if}
        <div class="flex flex-wrap gap-2">
          <Button
            size="sm"
            loading={promotionConfirming}
            disabled={promotionConfirming}
            onclick={confirmPromotion}
          >
            Confirm promotion
          </Button>
          <Button size="sm" variant="ghost" onclick={closePromotionPreview}>
            Cancel
          </Button>
        </div>
      </div>
    {/if}
    {#if promotionOutcome?.status === 'succeeded'}
      <div class="mt-4" role="status">
        <h2 class="text-lg">Promotion complete</h2>
        <p class="text-sm text-secondary">
          {promotionOutcome.result.moved.from} moved to
          {promotionOutcome.result.moved.to}.
        </p>
        {#if promotionChangedPaths.length}
          <section class="mt-3" aria-label="Promotion changed paths">
            <h3 class="font-medium">
              Changed paths and Git effects ({promotionChangedPaths.length})
            </h3>
            <ul class="list-disc pl-5 text-sm">
              {#each promotionChangedPaths as change (change.path)}
                <li>{change.path} — {change.effect}</li>
              {/each}
            </ul>
          </section>
        {/if}
      </div>
    {:else if promotionOutcome?.status === 'refused'}
      <div class="mt-4" role="alert">
        <h2 class="text-lg">
          {promotionOutcome.reason === 'stale-preview'
            ? 'Promotion preview is stale'
            : 'Promotion refused'}
        </h2>
        <p class="text-sm text-secondary">
          {promotionOutcome.detail ?? promotionOutcome.reason}
        </p>
        {#if promotionOutcome.reason === 'stale-preview'}
          <Button
            class="mt-3"
            size="sm"
            variant="secondary"
            onclick={previewPromotion}
          >
            Refresh preview
          </Button>
        {/if}
      </div>
    {:else if promotionOutcome?.status === 'failed'}
      <div class="mt-4" role="alert">
        <h2 class="text-lg">Promotion failed</h2>
        <p class="text-sm text-secondary">
          {promotionOutcome.reason}. Filesystem: {promotionOutcome.filesystem}.
          Recovery: {promotionOutcome.recovery}.
        </p>
      </div>
    {/if}
  </section>
  <footer
    class="surface-primary sticky bottom-0 mt-4 flex justify-end border-t border-subtle p-4"
  >
    <Button loading={$store.saving} disabled={$store.saving} onclick={save}>
      Save
    </Button>
  </footer>
</section>

<Modal
  id="catalog-authoring-leave-warning"
  bind:open={leaveWarningOpen}
  cancelText="Keep editing"
  confirmText="Discard browser edits"
  onCancelModal={restoreNavigationFocus}
  onConfirmModal={continueNavigation}
>
  {#snippet titleSnippet()}
    <h2>Discard browser edits?</h2>
  {/snippet}
  {#snippet content()}
    <p>
      Unsaved browser edits will be lost. The catalog.local scaffold will remain
      on disk.
    </p>
  {/snippet}
</Modal>
