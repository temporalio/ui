<script module lang="ts">
  import type { IconName } from '$lib/holocene/icon';

  import type { ReadinessCheck as HostReadinessCheck } from './workbench-host';

  export type WorkerReadinessDisplayState =
    | 'error'
    | 'indeterminate'
    | 'missing'
    | 'ready'
    | 'skipped'
    | 'unavailable';

  export const isCurrentCatalogDetailRequest = <Descriptor,>({
    currentDescriptor,
    currentEpoch,
    requestDescriptor,
    requestEpoch,
  }: {
    currentDescriptor: Descriptor;
    currentEpoch: number;
    requestDescriptor: Descriptor;
    requestEpoch: number;
  }) =>
    currentDescriptor === requestDescriptor && currentEpoch === requestEpoch;

  type ReadinessPresentation = {
    icon: IconName;
    iconClass: string;
    iconLabel: string;
    label: string;
    tooltip: string;
  };

  export const readinessPresentation = ({
    kind,
    state,
    taskQueue,
  }: {
    kind: HostReadinessCheck['kind'];
    state: WorkerReadinessDisplayState | 'loading';
    taskQueue: string;
  }): ReadinessPresentation => {
    const label =
      kind === 'worker'
        ? 'Handler worker is polling'
        : 'Endpoint matches the declared target and policy';
    const iconSubject =
      kind === 'worker' ? 'Worker readiness' : 'Nexus endpoint readiness';

    if (state === 'loading') {
      return {
        icon: 'spinner',
        iconClass: 'animate-spin text-secondary',
        iconLabel: `${iconSubject} is checking`,
        label,
        tooltip:
          kind === 'worker'
            ? 'Checking for workers…'
            : 'Checking Nexus endpoint readiness…',
      };
    }

    if (state === 'ready') {
      return {
        icon: 'circle-check',
        iconClass: 'text-success',
        iconLabel: `${iconSubject} is ready`,
        label,
        tooltip:
          kind === 'worker'
            ? 'A Worker is polling.'
            : 'Nexus endpoint is ready.',
      };
    }

    if (state === 'unavailable') {
      return {
        icon: 'warning',
        iconClass: 'text-warning',
        iconLabel: `${iconSubject} is unavailable`,
        label,
        tooltip:
          kind === 'worker'
            ? `This run will wait for a Worker to poll the ${taskQueue} Task Queue.`
            : 'Nexus endpoint is unavailable.',
      };
    }

    return {
      icon: 'circle-question',
      iconClass: 'text-secondary',
      iconLabel: `${iconSubject} status is unknown`,
      label,
      tooltip:
        kind === 'worker'
          ? 'Worker status couldn’t be checked.'
          : 'Nexus endpoint status couldn’t be checked.',
    };
  };

  export const nexusEndpointCreateCommand = ({
    endpoint,
    namespace,
    taskQueue,
  }: {
    endpoint: string;
    namespace: string;
    taskQueue: string;
  }): string =>
    `temporal operator nexus endpoint create --name ${endpoint} --target-namespace ${namespace} --target-task-queue ${taskQueue}`;
</script>

<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import Textarea from '$lib/holocene/textarea.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import { createReadinessLoader } from './readiness-loader';
  import { terminalStatusPresentation } from './session-presentation';
  import {
    type WorkflowCatalogSessionState,
    type WorkflowCatalogSessionStore,
    workflowCatalogTargetFingerprint,
  } from './session-store';
  import { startFromEditors } from './start-example';
  import type { BrowserWorkflowCatalogDescriptor, JsonValue } from './types';
  import type { ReadinessCheck, WorkbenchHost } from './workbench-host';

  interface Props {
    descriptor: BrowserWorkflowCatalogDescriptor;
    host: WorkbenchHost;
    sessionStore: WorkflowCatalogSessionStore;
  }

  let { descriptor, host, sessionStore }: Props = $props();

  let inputEditor = $state('');
  let startOptionsEditor = $state('');
  let configureOpen = $state(false);
  let editorError = $state('');
  let readiness = $state<ReadinessCheck[]>([]);
  let readinessError = $state(false);
  let readinessLoading = $state(true);
  let running = $state(false);
  let loadedExampleId = $state('');
  let descriptorEpoch = 0;
  const readinessLoader = createReadinessLoader(() => host);
  let workerReadinessState: WorkerReadinessDisplayState = $derived(
    readinessError
      ? 'error'
      : (readiness.find((check) => check.kind === 'worker')?.state ??
          'missing'),
  );
  let workerPresentation = $derived(
    readinessPresentation({
      kind: 'worker',
      state: readinessLoading ? 'loading' : workerReadinessState,
      taskQueue: descriptor.execution.taskQueue,
    }),
  );
  let prerequisiteReadiness = $derived(
    readiness.filter((check) => check.kind !== 'worker'),
  );
  let readinessAnnouncement = $derived(
    [
      workerPresentation.iconLabel,
      ...(readinessLoading
        ? []
        : prerequisiteReadiness.map(
            (check) =>
              readinessPresentation({
                kind: check.kind,
                state: check.state,
                taskQueue: descriptor.execution.taskQueue,
              }).iconLabel,
          )),
    ].join('. '),
  );
  let sessions = $derived(
    $sessionStore.sessions.filter(
      (session) =>
        session.exampleId === descriptor.id &&
        session.targetFingerprint ===
          workflowCatalogTargetFingerprint(descriptor.execution),
    ),
  );
  const normalizedKind = (value: string) =>
    value.toLocaleLowerCase().replaceAll('-', ' ');
  let capabilityTags = $derived(
    descriptor.capabilityTags.filter(
      (capability) =>
        normalizedKind(capability) !==
        normalizedKind(descriptor.execution.kind),
    ),
  );

  const formatJson = (value: JsonValue) => JSON.stringify(value, null, 2);

  const executionKindLabels: Record<
    BrowserWorkflowCatalogDescriptor['execution']['kind'],
    string
  > = {
    workflow: 'Workflow',
    'standalone-activity': 'Standalone Activity',
    'standalone-nexus-operation': 'Standalone Nexus Operation',
  };

  let executionKindLabel = $derived(
    executionKindLabels[descriptor.execution.kind],
  );

  const sessionStateLabels: Record<WorkflowCatalogSessionState, string> = {
    'execution-terminal': 'Finished',
    'launch-rejected': 'Start failed',
    'launch-uncertain': 'Start not confirmed',
    'observation-paused': 'Status checks paused',
    observing: 'Running',
    starting: 'Starting',
    stopped: 'Status checks stopped',
  };

  const relativeSessionTime = (createdAt: number) => {
    const distance = formatDistanceAbbreviated({
      start: createdAt,
      end: Date.now(),
      flexibleUnits: true,
    });

    return distance ? `${distance} ago` : 'just now';
  };

  const updateReadiness = (checks: ReadinessCheck[]) => {
    readiness = checks;
    readinessError = false;
  };

  const refreshReadiness = async (
    currentDescriptor: BrowserWorkflowCatalogDescriptor,
    requestEpoch: number,
  ) => {
    readinessLoading = true;
    readinessError = false;
    const result = await readinessLoader.load(currentDescriptor.id);

    if (
      result.state === 'stale' ||
      !isCurrentCatalogDetailRequest({
        currentDescriptor: descriptor,
        currentEpoch: descriptorEpoch,
        requestDescriptor: currentDescriptor,
        requestEpoch,
      })
    ) {
      return;
    }

    readinessLoading = false;
    if (result.state === 'error') {
      readiness = [];
      readinessError = true;
      return;
    }

    updateReadiness(result.checks);
  };

  $effect(() => {
    const currentDescriptor = descriptor;
    const requestEpoch = ++descriptorEpoch;
    running = false;
    void refreshReadiness(currentDescriptor, requestEpoch);

    return () => readinessLoader.cancel();
  });

  $effect(() => {
    if (loadedExampleId !== descriptor.id) {
      const draft = sessionStore.getDraft(descriptor.id);

      inputEditor =
        draft?.inputEditor ?? formatJson(descriptor.input.defaultValue);
      startOptionsEditor =
        draft?.startOptionsEditor ??
        formatJson(descriptor.startOptions.defaultValue);
      loadedExampleId = descriptor.id;
      configureOpen = false;
      editorError = '';
      readiness = [];
    }

    sessionStore.setDraft(descriptor.id, { inputEditor, startOptionsEditor });
  });

  const run = async () => {
    const runDescriptor = descriptor;
    const runEpoch = descriptorEpoch;
    readinessLoader.cancel();
    readiness = [];
    readinessError = false;
    readinessLoading = true;
    running = true;
    editorError = '';
    const result = await startFromEditors({
      descriptor: runDescriptor,
      host,
      inputEditor,
      startOptionsEditor,
      sessionStore,
      onReadiness: (checks) => {
        if (
          isCurrentCatalogDetailRequest({
            currentDescriptor: descriptor,
            currentEpoch: descriptorEpoch,
            requestDescriptor: runDescriptor,
            requestEpoch: runEpoch,
          })
        ) {
          updateReadiness(checks);
        }
      },
    });

    if (
      !isCurrentCatalogDetailRequest({
        currentDescriptor: descriptor,
        currentEpoch: descriptorEpoch,
        requestDescriptor: runDescriptor,
        requestEpoch: runEpoch,
      })
    ) {
      return;
    }

    readinessLoading = false;
    running = false;

    if (!('error' in result)) return;

    editorError =
      result.error === 'invalid-json'
        ? 'Input and start options must contain valid JSON.'
        : result.error === 'input-schema-mismatch'
          ? 'Input does not match this example’s schema.'
          : result.error === 'unsupported-start-options'
            ? 'Start options contain fields this example does not support.'
            : result.error === 'required-readiness-unavailable'
              ? 'A required service is unavailable. Check Readiness and try again.'
              : 'This example couldn’t be started. Check Readiness and try again.';
  };
</script>

<div class="space-y-6">
  <div
    class="grid w-full gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start"
    aria-label="Configure and run"
  >
    <div class="min-w-0 space-y-6">
      <section
        class="surface-primary min-w-0 space-y-4 rounded-sm border border-subtle p-4"
        aria-label="Configuration"
      >
        <h2 class="text-lg">Configuration</h2>
        <Textarea
          id="workflow-catalog-input"
          bind:value={inputEditor}
          label="Input JSON"
          description="JSON passed to the example when it starts."
          rows={10}
          spellcheck={false}
        />

        {#if configureOpen}
          <section
            class="surface-subtle rounded-sm border border-subtle p-3"
            aria-label="Start options"
          >
            <Textarea
              id="workflow-catalog-start-options"
              bind:value={startOptionsEditor}
              label="Start options JSON"
              description="These options apply only when you start this example."
              rows={8}
              spellcheck={false}
            />
          </section>
        {/if}

        {#if editorError}
          <p class="text-sm text-danger" role="alert">{editorError}</p>
        {/if}

        <div
          class="surface-primary sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-subtle py-3"
        >
          <Button
            size="sm"
            variant="ghost"
            trailingIcon={configureOpen ? 'chevron-up' : 'chevron-down'}
            aria-expanded={configureOpen}
            onclick={() => (configureOpen = !configureOpen)}
            >Start options</Button
          >
          <Button leadingIcon="play" disabled={running} onclick={run}>
            {running ? 'Running…' : 'Run'}
          </Button>
        </div>
      </section>

      <section class="space-y-3" aria-label="Runs">
        <h2 class="text-lg">Runs</h2>
        <div
          data-testid="run-sessions-region"
          class="max-h-96 w-full overflow-auto"
        >
          <Table aria-label="Runs" class="min-w-[44rem]" fixed>
            {#snippet caption()}
              <caption class="sr-only">Runs</caption>
            {/snippet}
            {#snippet headers()}
              <TableHeaderRow>
                <th scope="col">Attempt ID</th>
                <th scope="col" class="w-32">Started</th>
                <th scope="col" class="w-36">Status</th>
                <th scope="col" class="w-60 !text-right">Actions</th>
              </TableHeaderRow>
            {/snippet}
            {#if sessions.length}
              {#each sessions as session (session.id)}
                {@const evidence =
                  session.outcome?.status === 'accepted'
                    ? host.evidenceLink(session.outcome)
                    : undefined}
                <TableRow>
                  <td class="truncate py-2 font-mono text-xs text-secondary">
                    {session.id}
                  </td>
                  <td class="text-xs text-secondary">
                    {relativeSessionTime(session.createdAt)}
                  </td>
                  <td>
                    {#if session.state === 'execution-terminal'}
                      {@const status = terminalStatusPresentation(
                        session.terminalStatus!,
                      )}
                      <Badge
                        type={status.type}
                        class="px-1.5 py-0 text-xs leading-5"
                        >{status.label}</Badge
                      >
                    {:else}
                      <Badge type="subtle" class="px-1.5 py-0 text-xs leading-5"
                        >{sessionStateLabels[session.state]}</Badge
                      >
                    {/if}
                  </td>
                  <td>
                    <div
                      class="flex flex-nowrap items-center justify-end gap-1 sm:gap-2"
                    >
                      {#if evidence}
                        <Button
                          href={evidence.href}
                          size="xs"
                          variant="secondary"
                          class="h-7 px-1.5">{evidence.label}</Button
                        >
                      {/if}
                      {#if session.state === 'observation-paused'}
                        <Button
                          size="xs"
                          variant="secondary"
                          class="h-7 px-1.5"
                          onclick={() => sessionStore.resume(session.id)}
                          >Resume checking</Button
                        >
                      {/if}
                      {#if session.state === 'observing' || session.state === 'observation-paused'}
                        <Button
                          size="xs"
                          variant="ghost"
                          class="h-7 px-1.5"
                          onclick={() => sessionStore.stop(session.id)}
                          >Stop checking</Button
                        >
                      {/if}
                    </div>
                  </td>
                </TableRow>
              {/each}
            {:else}
              <TableRow>
                <td colspan="4" class="py-6 text-center text-sm text-secondary">
                  Runs appear here until you refresh the page.
                </td>
              </TableRow>
            {/if}
          </Table>
        </div>
      </section>
    </div>

    <aside class="space-y-4" aria-label="Execution details">
      <section
        class="surface-primary space-y-4 rounded-sm border border-subtle p-4"
        aria-label="Execution details"
      >
        <h2 class="text-base">Execution details</h2>
        {#if capabilityTags.length}
          <ul class="flex flex-wrap gap-2" aria-label="Capabilities">
            {#each capabilityTags as capability (capability)}
              <li><Badge type="ghost">{capability}</Badge></li>
            {/each}
          </ul>
        {/if}
        <dl class="divide-y divide-subtle text-sm">
          <div class="py-2 first:pt-0">
            <dt class="body-small text-secondary">Type</dt>
            <dd class="mt-0.5">{executionKindLabel}</dd>
          </div>
          <div class="py-2 first:pt-0">
            <dt class="body-small text-secondary">Namespace</dt>
            <dd class="mt-0.5">{descriptor.execution.namespace}</dd>
          </div>
          <div class="py-2">
            <dt class="body-small text-secondary">Task queue</dt>
            <dd class="mt-0.5 break-all font-mono text-xs">
              {descriptor.execution.taskQueue}
            </dd>
          </div>
          <div class="py-2 last:pb-0">
            <dt class="body-small text-secondary">Target</dt>
            <dd class="mt-0.5 break-all font-mono text-xs">
              {descriptor.execution.targetId}
            </dd>
          </div>
        </dl>
      </section>
      <section
        class="surface-primary space-y-3 rounded-sm border border-subtle p-4"
        aria-label="Readiness"
      >
        <div class="flex items-center justify-between gap-2">
          <h2 class="text-base">Readiness</h2>
          <Button
            size="xs"
            variant="ghost"
            disabled={readinessLoading}
            onclick={() => void refreshReadiness(descriptor, descriptorEpoch)}
            >Refresh</Button
          >
        </div>
        <span class="sr-only" aria-live="polite">{readinessAnnouncement}</span>
        <div class="space-y-2">
          <div class="surface-subtle rounded-sm p-2">
            <div class="flex items-center gap-2 text-sm">
              <Tooltip text={workerPresentation.tooltip} bottom>
                <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
                <span
                  class="flex size-4 shrink-0 items-center justify-center"
                  tabindex="0"
                  aria-label={workerPresentation.iconLabel}
                >
                  <Icon
                    name={workerPresentation.icon}
                    class={workerPresentation.iconClass}
                    aria-hidden="true"
                  />
                </span>
              </Tooltip>
              <span>{workerPresentation.label}</span>
            </div>
          </div>
          {#if !readinessLoading}
            {#each prerequisiteReadiness as check, index (`${check.kind}-${index}`)}
              {@const presentation = readinessPresentation({
                kind: check.kind,
                state: check.state,
                taskQueue: descriptor.execution.taskQueue,
              })}
              <div class="surface-subtle rounded-sm p-2">
                <div class="flex items-center gap-2 text-sm">
                  <Tooltip text={presentation.tooltip} bottom>
                    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
                    <span
                      class="flex size-4 shrink-0 items-center justify-center"
                      tabindex="0"
                      aria-label={presentation.iconLabel}
                    >
                      <Icon
                        name={presentation.icon}
                        class={presentation.iconClass}
                        aria-hidden="true"
                      />
                    </span>
                  </Tooltip>
                  <span>{presentation.label}</span>
                </div>
                {#if check.kind === 'nexus-endpoint' && check.state === 'unavailable' && descriptor.execution.kind === 'standalone-nexus-operation'}
                  <p class="mt-2 text-xs text-secondary">
                    Create the declared endpoint, then run the example again:
                  </p>
                  <Copyable
                    visible
                    clickAllToCopy
                    content={nexusEndpointCreateCommand(descriptor.execution)}
                    copyIconTitle="Copy the endpoint create command"
                    copySuccessIconTitle="Copied the endpoint create command"
                    container-class="mt-1"
                    class="font-mono text-xs"
                  />
                {/if}
              </div>
            {/each}
          {/if}
        </div>
      </section>
      <section
        class="surface-primary rounded-sm border border-subtle p-4"
        aria-label="What to verify"
      >
        <h2 class="text-base">What to verify</h2>
        <p class="mt-2 text-sm text-secondary">
          {descriptor.expectedEvidence.length
            ? descriptor.expectedEvidence.join(' · ')
            : 'Nothing to verify was specified.'}
        </p>
      </section>
    </aside>
  </div>
</div>
