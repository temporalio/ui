<script module lang="ts">
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
    Icon: IconComponent;
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
        Icon: IconSpinner,
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
        Icon: IconCheckCircle,
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
        Icon: IconWarning,
        iconClass: 'text-warning',
        iconLabel: `${iconSubject} is unavailable`,
        label,
        tooltip:
          kind === 'worker'
            ? `This run will wait for a Worker to poll the ${taskQueue} Task Queue. Run "pnpm catalog worker" to start one.`
            : 'Nexus endpoint is unavailable.',
      };
    }

    return {
      Icon: IconQuestionCircle,
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
  import PayloadInput from '$lib/components/payload-input.svelte';
  import AddSearchAttributes from '$lib/components/workflow/add-search-attributes.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Copyable from '$lib/holocene/copyable/index.svelte';
  import DurationInput, {
    DAYS,
    DEFAULT_UNITS,
    SECONDS,
  } from '$lib/holocene/duration-input/duration-input.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Label from '$lib/holocene/label.svelte';
  import MarkdownEditor from '$lib/holocene/markdown-editor/markdown-editor.svelte';
  import Markdown from '$lib/holocene/markdown-editor/preview.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import {
    IconCheckCircle,
    IconChevronDown,
    IconChevronUp,
    IconClose,
    type IconComponent,
    IconPlaySolid,
    IconQuestionCircle,
    IconSpinner,
    IconWarning,
  } from '$lib/io/icon';
  import type { SearchAttributesSchema } from '$lib/stores/search-attributes';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import { launchOutcomeExplanation } from './launch-outcome-presentation';
  import { createReadinessLoader } from './readiness-loader';
  import { terminalStatusPresentation } from './session-presentation';
  import {
    type CatalogSessionState,
    type CatalogSessionStore,
    catalogTargetFingerprint,
  } from './session-store';
  import { declaredExecutionId, startFromEditors } from './start-example';
  import { catalogSharedStartOptionNames } from './start-options';
  import type { BrowserCatalogDescriptor, JsonValue } from './types';
  import type { ReadinessCheck, WorkbenchHost } from './workbench-host';

  type FixedExecutionField = {
    id: string;
    label: string;
    value: string;
    placeholder?: string;
    hint?: string;
  };

  interface Props {
    descriptor: BrowserCatalogDescriptor;
    host: WorkbenchHost;
    sessionStore: CatalogSessionStore;
  }

  let { descriptor, host, sessionStore }: Props = $props();

  let inputEditor = $state('');
  let startOptionsEditor = $state('');
  let inputMalformed = $state(false);
  let configureOpen = $state(false);
  /**
   * Rendered empty on the server so the id shown is the one the browser will
   * actually send; the run pins it so the page never shows a value it did not
   * use.
   */
  let plannedExecutionId = $state('');
  let searchAttributes = $state<SearchAttributesSchema>([]);
  let workflowStartDelay = $state('');
  let summary = $state('');
  let details = $state('');
  /**
   * The shared controls only appear for examples whose generated schema
   * declares them, which keeps activity and Nexus examples free of options
   * their start request cannot carry.
   */
  let sharedStartOptionsDeclared = $derived.by(() => {
    const schema = descriptor.startOptions.schema;
    const properties =
      typeof schema === 'object' &&
      schema !== null &&
      typeof schema.properties === 'object' &&
      schema.properties !== null
        ? Object.keys(schema.properties)
        : [];

    return catalogSharedStartOptionNames.every((name) =>
      properties.includes(name),
    );
  });
  let sharedStartOptions = $derived({
    ...(searchAttributes.length
      ? {
          searchAttributes: Object.fromEntries(
            searchAttributes.map(({ label, value }) => [label, value]),
          ),
        }
      : {}),
    ...(workflowStartDelay ? { workflowStartDelay } : {}),
    ...(summary ? { summary } : {}),
    ...(details ? { details } : {}),
  });
  /**
   * The catalog pins these per example, so they are shown the way the start
   * workflow page shows them, populated and not editable.
   */
  let executionIdLabel = $derived(
    descriptor.execution.kind === 'workflow'
      ? 'Workflow ID'
      : descriptor.execution.kind === 'standalone-activity'
        ? 'Activity ID'
        : 'Operation ID',
  );
  let fixedExecutionFields: FixedExecutionField[] = $derived.by(() => {
    const execution = descriptor.execution;
    const pinnedId = declaredExecutionId(
      descriptor,
      descriptor.startOptions.defaultValue,
    );
    const identity: FixedExecutionField = {
      id: 'catalog-execution-id',
      label: executionIdLabel,
      value: pinnedId ?? plannedExecutionId,
      placeholder: pinnedId ? undefined : 'Generated for each run',
      hint: pinnedId ? undefined : 'Generated for the next run.',
    };
    const taskQueue: FixedExecutionField = {
      id: 'catalog-task-queue',
      label: 'Task Queue',
      value: execution.taskQueue,
    };

    if (execution.kind === 'workflow') {
      return [
        identity,
        taskQueue,
        {
          id: 'catalog-workflow-type',
          label: 'Workflow Type',
          value: execution.workflowType,
        },
      ];
    }

    if (execution.kind === 'standalone-activity') {
      return [
        identity,
        taskQueue,
        {
          id: 'catalog-activity-type',
          label: 'Activity Type',
          value: execution.activityType,
        },
      ];
    }

    return [
      identity,
      taskQueue,
      {
        id: 'catalog-endpoint',
        label: 'Endpoint',
        value: execution.endpoint,
      },
      {
        id: 'catalog-service',
        label: 'Service',
        value: execution.service,
      },
      {
        id: 'catalog-operation',
        label: 'Operation',
        value: execution.operation,
      },
    ];
  });
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
          catalogTargetFingerprint(descriptor.execution),
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
    BrowserCatalogDescriptor['execution']['kind'],
    string
  > = {
    workflow: 'Workflow',
    'standalone-activity': 'Standalone Activity',
    'standalone-nexus-operation': 'Standalone Nexus Operation',
  };

  let executionKindLabel = $derived(
    executionKindLabels[descriptor.execution.kind],
  );

  const sessionStateLabels: Record<CatalogSessionState, string> = {
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
    currentDescriptor: BrowserCatalogDescriptor,
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
      plannedExecutionId = crypto.randomUUID();
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
    const startedExecutionId = plannedExecutionId;
    const result = await startFromEditors({
      descriptor: runDescriptor,
      host,
      inputEditor,
      startOptionsEditor,
      executionId: startedExecutionId || undefined,
      sharedStartOptions: sharedStartOptionsDeclared
        ? sharedStartOptions
        : undefined,
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

    if (!('error' in result)) {
      // The shown id has been used, so the field moves on to the next one.
      if (plannedExecutionId === startedExecutionId) {
        plannedExecutionId = crypto.randomUUID();
      }
      return;
    }

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
        {#each fixedExecutionFields as field (field.id)}
          <Input
            id={field.id}
            label={field.label}
            value={field.value}
            placeholder={field.placeholder ?? ''}
            hintText={field.hint ?? ''}
            disabled
          />
        {/each}
        <PayloadInput
          id="catalog-input"
          bind:input={inputEditor}
          bind:error={inputMalformed}
          label="Input JSON"
          hintText="JSON passed to the example when it starts."
        />

        <!--
          Kept mounted rather than conditionally rendered: PayloadInput clears
          its bound value when it is destroyed, which would discard the start
          options every time this section collapsed.
        -->
        <section
          class="space-y-4"
          aria-label="Start options"
          hidden={!configureOpen}
        >
          <div class="rounded-sm border border-subtle p-3">
            <PayloadInput
              id="catalog-start-options"
              bind:input={startOptionsEditor}
              label="Start options JSON"
              hintText="These options apply only when you start this example."
            />
          </div>

          {#if sharedStartOptionsDeclared}
            <div class="space-y-2 rounded-sm border border-subtle p-3">
              <div>
                <h3 class="text-sm font-medium">Custom Search Attributes</h3>
                <p class="text-xs text-secondary">
                  Indexed fields used in a List Filter to filter a list of
                  Workflow Executions.
                </p>
              </div>
              <AddSearchAttributes
                bind:attributesToAdd={searchAttributes}
                buttonCopy="Add"
                variant="secondary"
              />
            </div>

            <div class="space-y-2 rounded-sm border border-subtle p-3">
              <div>
                <Label
                  for="catalog-start-delay"
                  label="Workflow Start Delay"
                  class="text-sm"
                />
                <p class="text-xs text-secondary">
                  Time to wait before dispatching the first workflow task.
                </p>
              </div>
              <DurationInput
                id="catalog-start-delay"
                label="Workflow Start Delay"
                labelHidden
                inputmode="numeric"
                bind:value={workflowStartDelay}
                units={[...DEFAULT_UNITS, DAYS]}
                initialUnit={SECONDS.label}
                min={0}
                class="max-w-80"
              />
            </div>

            <div class="space-y-2 rounded-sm border border-subtle p-3">
              <div>
                <h3 class="text-sm font-medium">User Metadata</h3>
                <p class="text-xs text-secondary">
                  Add context to the Workflow Execution to help identify and
                  understand its operations. Markdown supported.
                </p>
              </div>
              <Label label="Summary" for="catalog-summary" />
              <MarkdownEditor bind:content={summary} />
              <Label label="Details" for="catalog-details" />
              <MarkdownEditor bind:content={details} />
            </div>
          {/if}
        </section>

        {#if editorError}
          <p class="text-sm text-danger" role="alert">{editorError}</p>
        {/if}

        <div
          class="surface-primary sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-subtle py-3"
        >
          <Button
            size="sm"
            variant="ghost"
            TrailingIcon={configureOpen ? IconChevronUp : IconChevronDown}
            aria-expanded={configureOpen}
            onclick={() => (configureOpen = !configureOpen)}
            >Start options</Button
          >
          <Button
            LeadingIcon={IconPlaySolid}
            disabled={running || inputMalformed}
            onclick={run}
          >
            {running ? 'Starting…' : 'Start'}
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
                <th scope="col">{executionIdLabel}</th>
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
                    {session.reference.attempt.executionId}
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
                      {@const explanation =
                        launchOutcomeExplanation(session.outcome) ??
                        session.error}
                      <Badge type="subtle" class="px-1.5 py-0 text-xs leading-5"
                        >{sessionStateLabels[session.state]}</Badge
                      >
                      {#if explanation}
                        <p class="mt-1 text-xs text-secondary">{explanation}</p>
                      {/if}
                    {/if}
                  </td>
                  <td>
                    <div
                      class="flex flex-nowrap items-center justify-end gap-1 sm:gap-2"
                    >
                      <!--
                        The observation controls come and go while a run is
                        watched, so they sit ahead of the link in this
                        right-aligned row and stay icon sized. That keeps the
                        link anchored to the same spot for every row.
                      -->
                      {#if session.state === 'observation-paused'}
                        <Button
                          size="xs"
                          variant="ghost"
                          class="h-7 px-1.5"
                          LeadingIcon={IconPlaySolid}
                          aria-label="Resume checking"
                          onclick={() => sessionStore.resume(session.id)}
                        />
                      {/if}
                      {#if session.state === 'observing' || session.state === 'observation-paused'}
                        <Button
                          size="xs"
                          variant="ghost"
                          class="h-7 px-1.5"
                          LeadingIcon={IconClose}
                          aria-label="Stop checking"
                          onclick={() => sessionStore.stop(session.id)}
                        />
                      {/if}
                      {#if evidence}
                        <Button
                          href={evidence.href}
                          size="xs"
                          variant="secondary"
                          class="h-7 px-1.5">{evidence.label}</Button
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
                  <workerPresentation.Icon
                    class={workerPresentation.iconClass}
                  />
                </span>
              </Tooltip>
              <span>{workerPresentation.label}</span>
            </div>
            {#if !readinessLoading && workerReadinessState === 'unavailable'}
              <p class="mt-2 text-xs text-secondary">
                Start a catalog worker, then run the example:
              </p>
              <Copyable
                visible
                clickAllToCopy
                content="pnpm catalog worker"
                copyIconTitle="Copy the worker start command"
                copySuccessIconTitle="Copied the worker start command"
                container-class="mt-1"
                class="font-mono text-xs"
              />
            {/if}
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
                      <presentation.Icon class={presentation.iconClass} />
                    </span>
                  </Tooltip>
                  <span>{presentation.label}</span>
                </div>
                {#if check.kind === 'nexus-endpoint' && check.state === 'unavailable'}
                  <p class="mt-2 text-xs text-secondary">
                    Create the declared endpoint, then run the example again:
                  </p>
                  <Copyable
                    visible
                    clickAllToCopy
                    content={nexusEndpointCreateCommand({
                      endpoint: check.endpoint,
                      namespace: descriptor.execution.namespace,
                      taskQueue: descriptor.execution.taskQueue,
                    })}
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
      {#if descriptor.setupMarkdown}
        <section
          class="surface-primary rounded-sm border border-subtle p-4"
          aria-label="Setup"
        >
          <h2 class="text-base">Setup</h2>
          <Markdown
            frameId={`catalog-setup-${descriptor.id}`}
            class="mt-2"
            overrideTheme="primary"
            content={descriptor.setupMarkdown}
          />
        </section>
      {/if}
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
