<script module lang="ts">
  import {
    logLaunchOutcome,
    logLaunchRequested,
    logObservationPaused,
    logObservationTerminal,
  } from './execution-log';
  import validateJsonSchema from './schema-validator';
  import type { WorkflowCatalogSessionStore } from './session-store';
  import type {
    BrowserWorkflowCatalogDescriptor,
    JsonSchema,
    JsonValue,
  } from './types';
  import {
    type AcceptedLaunchOutcome,
    type AttemptIdentity,
    createAttemptIdentity,
    type ExecutionTerminalStatus,
    type LaunchOutcome,
    type ReadinessCheck,
    type WorkbenchHost,
  } from './workbench-host';

  type EditorError =
    | 'invalid-schema'
    | 'invalid-json'
    | 'input-schema-mismatch'
    | 'required-readiness-unavailable'
    | 'unsupported-start-options'
    | 'unable-to-start';
  type StartFromEditorsResult =
    | { error: Exclude<EditorError, 'unable-to-start'> }
    | { error: 'unable-to-start'; attempt?: AttemptIdentity }
    | { attempt: AttemptIdentity; outcome: LaunchOutcome };

  export type ObservationSessionResult = {
    state: 'execution-terminal' | 'observation-paused' | 'stopped';
    snapshot?: JsonValue;
    continuation?: JsonValue;
    terminalStatus?: ExecutionTerminalStatus;
    error?: string;
  };

  type RunningObservationUpdate = {
    snapshot: JsonValue;
    continuation: JsonValue;
  };

  const parseJson = (source: string): JsonValue =>
    JSON.parse(source) as JsonValue;

  const isJsonObject = (value: JsonValue): value is Record<string, JsonValue> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

  const assertSynchronousSchema = (schema: JsonSchema): void => {
    if (isJsonObject(schema) && schema.$async === true) {
      throw new Error('Async JSON Schema validation is not supported');
    }
  };

  const opaqueSchemaValueKeywords = new Set([
    'const',
    'default',
    'enum',
    'examples',
  ]);

  const findLocalSchemaAnchor = (
    value: JsonValue,
    anchor: string,
  ): JsonSchema | undefined => {
    if (Array.isArray(value)) {
      for (const member of value) {
        const found = findLocalSchemaAnchor(member, anchor);

        if (found !== undefined) return found;
      }

      return;
    }

    if (!isJsonObject(value)) return;
    if (value.$anchor === anchor) return value;

    for (const [keyword, nestedValue] of Object.entries(value)) {
      if (opaqueSchemaValueKeywords.has(keyword)) continue;

      const found = findLocalSchemaAnchor(nestedValue, anchor);

      if (found !== undefined) return found;
    }
  };

  const resolveLocalSchemaReference = (
    root: JsonSchema,
    reference: string,
  ): JsonSchema | undefined => {
    if (typeof root === 'boolean' || !reference.startsWith('#')) return;
    if (reference === '#') return root;

    if (!reference.startsWith('#/')) {
      try {
        return findLocalSchemaAnchor(
          root,
          decodeURIComponent(reference.slice(1)),
        );
      } catch {
        return;
      }
    }

    let resolved: JsonValue = root;

    for (const encodedSegment of reference.slice(2).split('/')) {
      const segment = encodedSegment
        .replaceAll('~1', '/')
        .replaceAll('~0', '~');

      if (Array.isArray(resolved)) {
        if (!/^(0|[1-9]\d*)$/.test(segment)) return;

        const indexed: JsonValue | undefined = resolved[Number(segment)];

        if (indexed === undefined) return;
        resolved = indexed;
        continue;
      }

      if (!isJsonObject(resolved)) return;

      const property = resolved[segment];

      if (property === undefined) return;
      resolved = property;
    }

    if (typeof resolved === 'boolean' || isJsonObject(resolved)) {
      return resolved;
    }
  };

  const declaredStartOptionKeys = (
    schema: JsonSchema,
    root: JsonSchema = schema,
    visited: object[] = [],
  ): string[] => {
    const declared: string[] = [];
    const addDeclared = (property: string) => {
      if (!declared.includes(property)) declared.push(property);
    };

    if (typeof schema === 'boolean' || visited.includes(schema))
      return declared;

    visited.push(schema);

    if (isJsonObject(schema.properties)) {
      for (const property of Object.keys(schema.properties)) {
        addDeclared(property);
      }
    }

    if (typeof schema.$ref === 'string') {
      const referenced = resolveLocalSchemaReference(root, schema.$ref);

      if (referenced !== undefined) {
        for (const property of declaredStartOptionKeys(
          referenced,
          root,
          visited,
        )) {
          addDeclared(property);
        }
      }
    }

    for (const keyword of ['allOf', 'anyOf', 'oneOf'] as const) {
      const members = schema[keyword];

      if (!Array.isArray(members)) continue;

      for (const member of members) {
        if (typeof member !== 'boolean' && !isJsonObject(member)) continue;

        for (const property of declaredStartOptionKeys(member, root, visited)) {
          addDeclared(property);
        }
      }
    }

    for (const keyword of ['if', 'then', 'else'] as const) {
      const member = schema[keyword];

      if (typeof member !== 'boolean' && !isJsonObject(member)) continue;

      for (const property of declaredStartOptionKeys(member, root, visited)) {
        addDeclared(property);
      }
    }

    return declared;
  };

  const matchesStartOptionsSchema = async (
    value: JsonValue,
    schema: JsonSchema,
  ): Promise<boolean> => {
    if (!isJsonObject(value)) return false;

    const matches = await validateJsonSchema(schema, value);
    const declared = declaredStartOptionKeys(schema);

    return matches && Object.keys(value).every((key) => declared.includes(key));
  };

  export const formatReadinessCheck = (check: ReadinessCheck) => {
    const state = `${check.state[0]?.toUpperCase()}${check.state.slice(1)}`;
    const subject =
      check.kind === 'nexus-endpoint' ? 'Nexus endpoint' : 'Worker readiness';

    return `${subject}: ${state}`;
  };

  export const terminalStatusPresentation = (
    status: ExecutionTerminalStatus,
  ) => {
    if (status === 'completed') {
      return { label: 'Completed', type: 'success' as const };
    }
    if (status === 'canceled') {
      return { label: 'Canceled', type: 'warning' as const };
    }
    if (status === 'continued-as-new') {
      return { label: 'Continued as new', type: 'primary' as const };
    }

    const label =
      status === 'timed-out'
        ? 'Timed out'
        : `${status[0]?.toUpperCase()}${status.slice(1)}`;

    return { label, type: 'danger' as const };
  };

  const isAbortError = (error: unknown) =>
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'AbortError';

  export const observeAcceptedAttempt = async ({
    host,
    reference,
    signal,
    snapshot,
    continuation,
    onRunning,
  }: {
    host: WorkbenchHost;
    reference: AcceptedLaunchOutcome['reference'];
    signal: AbortSignal;
    snapshot?: JsonValue;
    continuation?: JsonValue;
    onRunning?: (update: RunningObservationUpdate) => void;
  }): Promise<ObservationSessionResult> => {
    let lastSnapshot = snapshot;
    let nextContinuation = continuation;

    try {
      while (!signal.aborted) {
        const observation = await host.observe(
          {
            reference,
            ...(nextContinuation === undefined
              ? {}
              : { continuation: nextContinuation }),
          },
          signal,
        );
        lastSnapshot = observation.snapshot;

        if (observation.state === 'terminal') {
          logObservationTerminal(reference, observation.status);
          return {
            state: 'execution-terminal',
            snapshot: lastSnapshot,
            terminalStatus: observation.status,
          };
        }

        nextContinuation = observation.continuation;
        onRunning?.({
          snapshot: lastSnapshot,
          continuation: nextContinuation,
        });
      }

      return {
        state: 'stopped',
        snapshot: lastSnapshot,
        continuation: nextContinuation,
      };
    } catch (error) {
      if (signal.aborted || isAbortError(error)) {
        return {
          state: 'stopped',
          snapshot: lastSnapshot,
          continuation: nextContinuation,
        };
      }

      logObservationPaused(reference);
      return {
        state: 'observation-paused',
        snapshot: lastSnapshot,
        continuation: nextContinuation,
        error: 'Observation paused. Resume to keep checking this execution.',
      };
    }
  };

  export const createReadinessLoader = (getHost: () => WorkbenchHost) => {
    let epoch = 0;
    let controller: AbortController | undefined;

    return {
      cancel: () => {
        epoch += 1;
        controller?.abort();
        controller = undefined;
      },
      load: async (exampleId: string) => {
        controller?.abort();
        controller = new AbortController();
        const requestEpoch = ++epoch;

        try {
          const checks = await getHost().checkReadiness(
            exampleId,
            controller.signal,
          );

          return requestEpoch === epoch
            ? ({ state: 'current', checks } as const)
            : ({ state: 'stale' } as const);
        } catch (error) {
          if (requestEpoch !== epoch || isAbortError(error)) {
            return { state: 'stale' } as const;
          }

          return { state: 'error' } as const;
        }
      },
    };
  };

  export const startFromEditors = async ({
    descriptor,
    host,
    inputEditor,
    startOptionsEditor,
    onStarting,
    onReadiness,
    sessionStore,
  }: {
    descriptor: BrowserWorkflowCatalogDescriptor;
    host: WorkbenchHost;
    inputEditor: string;
    startOptionsEditor: string;
    onStarting?: (attempt: AttemptIdentity) => void;
    onReadiness?: (checks: ReadinessCheck[]) => void;
    sessionStore?: Pick<WorkflowCatalogSessionStore, 'start'>;
  }): Promise<StartFromEditorsResult> => {
    let input: JsonValue;
    let startOptions: JsonValue;

    try {
      input = parseJson(inputEditor);
      startOptions = parseJson(startOptionsEditor);
    } catch {
      return { error: 'invalid-json' };
    }

    let inputMatchesSchema: boolean;
    let startOptionsMatchSchema: boolean;

    try {
      assertSynchronousSchema(descriptor.input.schema);
      assertSynchronousSchema(descriptor.startOptions.schema);
      inputMatchesSchema = await validateJsonSchema(
        descriptor.input.schema,
        input,
      );
      startOptionsMatchSchema = await matchesStartOptionsSchema(
        startOptions,
        descriptor.startOptions.schema,
      );
    } catch {
      return { error: 'invalid-schema' };
    }

    if (!inputMatchesSchema) {
      return { error: 'input-schema-mismatch' };
    }

    if (!startOptionsMatchSchema) {
      return { error: 'unsupported-start-options' };
    }

    let readiness: ReadinessCheck[];

    try {
      readiness = await host.checkReadiness(descriptor.id);
    } catch {
      return { error: 'unable-to-start' };
    }
    onReadiness?.(readiness);

    if (
      readiness.some((check) => check.required && check.state === 'unavailable')
    ) {
      return { error: 'required-readiness-unavailable' };
    }

    if (sessionStore) {
      const session = await sessionStore.start({
        descriptor,
        input,
        startOptions,
      });

      if (!session?.outcome) return { error: 'unable-to-start' };

      return { attempt: session.reference.attempt, outcome: session.outcome };
    }

    const attempt = createAttemptIdentity();
    onStarting?.(attempt);
    logLaunchRequested({
      exampleId: descriptor.id,
      attempt,
      target: {
        targetId: descriptor.execution.targetId,
        namespace: descriptor.execution.namespace,
        taskQueue: descriptor.execution.taskQueue,
      },
    });

    try {
      const outcome = await host.start({
        exampleId: descriptor.id,
        attempt,
        input,
        startOptions,
      });
      logLaunchOutcome(outcome);

      return { attempt, outcome };
    } catch {
      logLaunchOutcome({
        status: 'rejected',
        reason: 'unable-to-start',
        reference: {
          exampleId: descriptor.id,
          attempt,
          target: {
            targetId: descriptor.execution.targetId,
            namespace: descriptor.execution.namespace,
            taskQueue: descriptor.execution.taskQueue,
          },
        },
      });
      return { error: 'unable-to-start', attempt };
    }
  };

  export const startWithDefaults = ({
    descriptor,
    host,
    sessionStore,
  }: {
    descriptor: BrowserWorkflowCatalogDescriptor;
    host: WorkbenchHost;
    sessionStore: Pick<WorkflowCatalogSessionStore, 'start'>;
  }) =>
    startFromEditors({
      descriptor,
      host,
      inputEditor: JSON.stringify(descriptor.input.defaultValue),
      startOptionsEditor: JSON.stringify(descriptor.startOptions.defaultValue),
      sessionStore,
    });
</script>

<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Textarea from '$lib/holocene/textarea.svelte';
  import { translate } from '$lib/i18n/translate';

  import {
    createWorkflowCatalogSessionStore,
    workflowCatalogTargetFingerprint,
  } from './session-store';
  import type {
    BrowserWorkflowCatalogExecution,
    BrowserWorkflowCatalogSource,
  } from './types';

  type SourceFilter = 'all' | BrowserWorkflowCatalogSource;

  interface Props {
    descriptors: readonly BrowserWorkflowCatalogDescriptor[];
    host: WorkbenchHost;
    sessionStore?: WorkflowCatalogSessionStore;
  }

  let {
    descriptors,
    host,
    sessionStore = createWorkflowCatalogSessionStore(host),
  }: Props = $props();

  let query = $state('');
  let filter = $state<SourceFilter>('all');
  let selectedId = $state<string | null>(null);
  let configureOpen = $state(false);
  let inputEditor = $state('');
  let startOptionsEditor = $state('');
  let editorError = $state('');
  let readiness = $state<ReadinessCheck[]>([]);
  let readinessError = $state('');
  let readinessLoading = $state(false);
  let selectionEpoch = 0;
  const readinessLoader = createReadinessLoader(() => host);

  const selected = $derived(
    selectedId
      ? descriptors.find((descriptor) => descriptor.id === selectedId)
      : undefined,
  );
  const visibleDescriptors = $derived(
    descriptors.filter((descriptor) => {
      const matchesFilter = filter === 'all' || descriptor.source === filter;
      const searchable = [
        descriptor.title,
        descriptor.description,
        descriptor.execution.kind,
        ...descriptor.capabilityTags,
      ]
        .join(' ')
        .toLocaleLowerCase();

      return (
        matchesFilter && searchable.includes(query.trim().toLocaleLowerCase())
      );
    }),
  );
  const visibleSessions = $derived(
    $sessionStore.sessions.filter(
      (session) =>
        !selected ||
        (session.exampleId === selected.id &&
          session.targetFingerprint ===
            workflowCatalogTargetFingerprint(selected.execution)),
    ),
  );

  const kindLabel = (kind: BrowserWorkflowCatalogExecution['kind']) => {
    if (kind === 'workflow') return translate('workflow-catalog.workflow');
    if (kind === 'standalone-activity') {
      return translate('workflow-catalog.standalone-activity');
    }
    return translate('workflow-catalog.standalone-nexus-operation');
  };

  const formatJson = (value: JsonValue) => JSON.stringify(value, null, 2);

  const refreshReadiness = async (
    descriptor: BrowserWorkflowCatalogDescriptor,
  ) => {
    readinessLoading = true;
    readinessError = '';
    const result = await readinessLoader.load(descriptor.id);

    if (result.state === 'stale' || selectedId !== descriptor.id) return [];

    readinessLoading = false;
    if (result.state === 'error') {
      readiness = [];
      readinessError = 'Readiness could not be checked.';
      return [];
    }

    readiness = result.checks;
    return result.checks;
  };

  const selectDescriptor = (descriptor: BrowserWorkflowCatalogDescriptor) => {
    selectionEpoch += 1;
    selectedId = descriptor.id;
    configureOpen = false;
    editorError = '';
    readiness = [];
    inputEditor = formatJson(descriptor.input.defaultValue);
    startOptionsEditor = formatJson(descriptor.startOptions.defaultValue);
    void refreshReadiness(descriptor);
  };

  const showAllExamples = () => {
    selectionEpoch += 1;
    readinessLoader.cancel();
    selectedId = null;
    configureOpen = false;
    editorError = '';
    readiness = [];
    readinessError = '';
    readinessLoading = false;
  };

  const setFilter = (nextFilter: SourceFilter) => {
    filter = nextFilter;
    if (selected && nextFilter !== 'all' && selected.source !== nextFilter) {
      showAllExamples();
    }
  };

  const start = async () => {
    if (!selected) return;

    const descriptor = selected;
    const inputSource = inputEditor;
    const startOptionsSource = startOptionsEditor;
    const runSelectionEpoch = selectionEpoch;

    readinessLoading = true;
    const result = await startFromEditors({
      descriptor,
      host,
      inputEditor: inputSource,
      startOptionsEditor: startOptionsSource,
      onReadiness: (checks) => {
        if (
          selectionEpoch === runSelectionEpoch &&
          selectedId === descriptor.id
        ) {
          readiness = checks;
          readinessError = '';
        }
      },
      sessionStore,
    });
    if (selectionEpoch === runSelectionEpoch) readinessLoading = false;

    if ('error' in result) {
      const runError =
        result.error === 'invalid-schema'
          ? 'This example has an invalid schema.'
          : result.error === 'required-readiness-unavailable'
            ? 'A required dependency is unavailable.'
            : translate(`workflow-catalog.${result.error}`);
      if (selectionEpoch === runSelectionEpoch) editorError = runError;
      return;
    }

    if (selectionEpoch === runSelectionEpoch) editorError = '';
  };

  const outcomeLabel = (outcome: LaunchOutcome) => {
    if (outcome.status === 'accepted')
      return translate('workflow-catalog.accepted');
    if (outcome.status === 'rejected')
      return translate('workflow-catalog.rejected');
    return translate('workflow-catalog.uncertain');
  };
</script>

<div class="space-y-6">
  <div
    role="search"
    aria-label={translate('workflow-catalog.filter-examples')}
    class="flex w-full flex-wrap items-center gap-2 border border-subtle bg-primary p-1.5"
  >
    <Input
      id="workflow-catalog-search"
      bind:value={query}
      icon="search"
      label={translate('workflow-catalog.search-examples')}
      labelHidden
      type="search"
      placeholder={translate('workflow-catalog.search-examples')}
      class="min-w-64 flex-1"
    />
    <div
      class="flex flex-wrap items-center gap-1"
      role="group"
      aria-label={translate('workflow-catalog.source-filter')}
    >
      {#each [['all', translate('workflow-catalog.all')], ['shared', translate('workflow-catalog.shared')], ['local', translate('workflow-catalog.local')]] as [value, label] (value)}
        <Button
          size="xs"
          variant="secondary"
          active={filter === value}
          aria-pressed={filter === value}
          class="justify-center px-3"
          onclick={() => setFilter(value as SourceFilter)}>{label}</Button
        >
      {/each}
    </div>
  </div>

  <div class="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
    <aside
      class="border-b border-subtle pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6"
    >
      <p class="body-small-medium mb-3 uppercase tracking-wider text-secondary">
        {translate('workflow-catalog.examples')}
      </p>
      {#if visibleDescriptors.length}
        <nav
          aria-label={translate('workflow-catalog.examples')}
          class="flex flex-col gap-1"
        >
          {#each visibleDescriptors as descriptor (descriptor.id)}
            <Button
              variant="ghost"
              size="sm"
              active={selectedId === descriptor.id}
              aria-pressed={selectedId === descriptor.id}
              class="w-full justify-between gap-2 px-2 text-left"
              onclick={() => selectDescriptor(descriptor)}
            >
              <span class="min-w-0 truncate">{descriptor.title}</span>
              <span class="flex shrink-0 items-center gap-1">
                {#if descriptor.source === 'local'}
                  <Badge type="warning" class="text-xs">Local</Badge>
                {/if}
                <Badge type="subtle" class="text-xs"
                  >{kindLabel(descriptor.execution.kind)}</Badge
                >
              </span>
            </Button>
          {/each}
        </nav>
      {:else}
        <p class="text-sm text-secondary">
          {translate('workflow-catalog.no-examples')}
        </p>
      {/if}
    </aside>

    <section class="min-w-0" aria-live="polite">
      {#if selected}
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              size="xs"
              leadingIcon="arrow-left"
              onclick={showAllExamples}
              >{translate('workflow-catalog.all-examples')}</Button
            >
            <div class="mt-2 flex flex-wrap items-center gap-2">
              <h3 class="text-2xl">{selected.title}</h3>
              {#if selected.source === 'local'}
                <Badge type="warning">Local</Badge>
              {/if}
              <Badge type="primary">{kindLabel(selected.execution.kind)}</Badge>
            </div>
            <p class="mt-2 max-w-2xl text-sm leading-6 text-secondary">
              {selected.description}
            </p>
          </div>
          <Badge type="ghost"
            >{selected.execution.namespace} · {selected.execution
              .taskQueue}</Badge
          >
        </div>

        <dl class="mt-6 grid gap-3 text-sm sm:grid-cols-3">
          <div class="surface-subtle rounded-sm p-3">
            <dt class="body-small text-secondary">
              {translate('workflow-catalog.target')}
            </dt>
            <dd class="mt-1 font-mono">{selected.execution.targetId}</dd>
          </div>
          <div class="surface-subtle rounded-sm p-3 sm:col-span-2">
            <dt class="body-small text-secondary">
              {translate('workflow-catalog.expected-evidence')}
            </dt>
            <dd class="mt-1">{selected.expectedEvidence.join(' · ')}</dd>
          </div>
        </dl>

        <section
          class="surface-subtle mt-5 rounded-sm p-3"
          aria-label="Readiness"
        >
          <h4 class="body-small text-secondary">Readiness</h4>
          {#if readinessLoading}
            <p class="mt-1 text-sm">Checking readiness…</p>
          {:else if readinessError}
            <p class="mt-1 text-sm text-secondary">{readinessError}</p>
          {:else if readiness.length}
            <ul class="mt-1 space-y-1 text-sm">
              {#each readiness as check (check.kind)}
                <li>{formatReadinessCheck(check)}</li>
              {/each}
            </ul>
          {:else}
            <p class="mt-1 text-sm text-secondary">
              No readiness checks reported.
            </p>
          {/if}
        </section>

        <div class="mt-6">
          <Textarea
            id="workflow-catalog-input"
            bind:value={inputEditor}
            label={translate('workflow-catalog.edit-input')}
            description={translate('workflow-catalog.input-description')}
            rows={8}
            spellcheck={false}
          />
        </div>

        {#if configureOpen}
          <section
            class="surface-subtle mt-5 rounded-sm p-4"
            aria-label={translate('workflow-catalog.configure-example')}
          >
            <Textarea
              id="workflow-catalog-start-options"
              bind:value={startOptionsEditor}
              label={translate('workflow-catalog.edit-start-options')}
              description={translate(
                'workflow-catalog.start-options-description',
              )}
              rows={8}
              spellcheck={false}
            />
          </section>
        {/if}

        {#if editorError}
          <p class="mt-3 text-sm text-danger" role="alert">{editorError}</p>
        {/if}

        <div
          class="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-subtle pt-5"
        >
          <Button
            variant="ghost"
            trailingIcon={configureOpen ? 'chevron-up' : 'chevron-down'}
            aria-expanded={configureOpen}
            onclick={() => (configureOpen = !configureOpen)}
            >{translate('workflow-catalog.configure-example')}</Button
          >
          <Button leadingIcon="play" onclick={start}
            >{translate('workflow-catalog.run-example')}</Button
          >
        </div>
      {:else}
        <div class="max-w-3xl">
          <p class="body-small-medium uppercase tracking-wider text-brand">
            {translate('workflow-catalog.title')}
          </p>
          <h3 class="mt-3 text-3xl">
            {translate('workflow-catalog.choose-example')}
          </h3>
          <p class="mt-4 text-base leading-7 text-secondary">
            {translate('workflow-catalog.choose-example-description')}
          </p>
        </div>
      {/if}
    </section>
  </div>

  {#if visibleSessions.length}
    <section
      class="border-t border-subtle pt-6"
      aria-label={translate('workflow-catalog.run-sessions')}
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 class="text-lg">{translate('workflow-catalog.run-sessions')}</h3>
          <p class="body-small mt-1 text-secondary">
            {translate('workflow-catalog.run-sessions-description')}
          </p>
        </div>
        <Badge type="subtle">{visibleSessions.length}</Badge>
      </div>
      <ul class="mt-4 divide-y divide-subtle border-y border-subtle">
        {#each visibleSessions as session (session.id)}
          <li class="flex flex-wrap items-center justify-between gap-3 py-3">
            <div>
              <p class="font-medium">{session.exampleTitle}</p>
              <p class="body-small mt-1 font-mono text-secondary">
                {session.id}
              </p>
            </div>
            <div class="flex items-center gap-3">
              {#if session.state === 'starting'}
                <Badge type="primary"
                  >{translate('workflow-catalog.starting')}</Badge
                >
              {:else if session.state === 'observing'}
                <Badge type="primary">Observing</Badge>
              {:else if session.state === 'observation-paused'}
                <Badge type="warning">Observation paused</Badge>
                <Button
                  size="xs"
                  variant="secondary"
                  onclick={() => sessionStore.resume(session.id)}>Resume</Button
                >
              {:else if session.state === 'execution-terminal'}
                {@const terminal = terminalStatusPresentation(
                  session.terminalStatus!,
                )}
                <Badge type={terminal.type}>{terminal.label}</Badge>
              {:else if session.state === 'stopped'}
                <Badge type="subtle">Stopped</Badge>
              {:else if session.outcome}
                <Badge
                  type={session.outcome.status === 'accepted'
                    ? 'success'
                    : session.outcome.status === 'rejected'
                      ? 'danger'
                      : 'warning'}>{outcomeLabel(session.outcome)}</Badge
                >
              {:else}
                <Badge type="danger">{session.error}</Badge>
              {/if}
              {#if session.snapshot !== undefined}
                <span class="body-small text-secondary"
                  >Latest snapshot saved</span
                >
              {/if}
              {#if session.outcome?.status === 'accepted'}
                {@const evidence = host.evidenceLink(session.outcome)}
                <a class="text-sm text-primary underline" href={evidence.href}
                  >{evidence.label}</a
                >
              {/if}
              {#if session.state === 'observing' || session.state === 'observation-paused'}
                <Button
                  size="xs"
                  variant="ghost"
                  onclick={() => sessionStore.stop(session.id)}>Stop</Button
                >
              {/if}
            </div>
          </li>
        {/each}
      </ul>
    </section>
  {/if}
</div>
