<script lang="ts">
  import { afterNavigate, goto } from '$app/navigation';
  import { page } from '$app/state';

  import WorkflowTimeline from '$lib/components/lines-and-dots/workflow-timeline.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowHistoryProvider from '$lib/layouts/workflow-history-provider.svelte';
  import { allEventTypeOptions } from '$lib/models/event-history/get-event-categorization';
  import {
    collapseIdleTime,
    type EventSortOrder,
  } from '$lib/stores/event-view';
  import type { EventTypeFilterChange } from '$lib/types/events';
  import {
    parseEventFilterParams,
    updateEventFilterParams,
  } from '$lib/utilities/event-filter-params';
  import {
    routeForWorkflow,
    routeForWorkflowExecutionChain,
  } from '$lib/utilities/route-for';
  import { toURL } from '$lib/utilities/to-url';
  import {
    gotoOptions,
    updateQueryParameters,
  } from '$lib/utilities/update-query-parameters';
  import ChainHeader from '$lib/workflow-execution-chain/chain-header.svelte';
  import ChainMismatchWarning from '$lib/workflow-execution-chain/chain-mismatch-warning.svelte';
  import ChainSkeleton from '$lib/workflow-execution-chain/chain-skeleton.svelte';
  import RunStrip from '$lib/workflow-execution-chain/run-strip.svelte';
  import type { RunNotice } from '$lib/workflow-execution-chain/types';
  import WorkflowChainError from '$lib/workflow-execution-chain/workflow-chain-error.svelte';
  import { WorkflowExecutionChain } from '$lib/workflow-execution-chain/workflow-execution-chain.svelte';

  interface Props {
    namespace: string;
    workflowId: string;
    firstRunId: string;
  }

  let { namespace, workflowId, firstRunId }: Props = $props();

  const chain = $derived(
    new WorkflowExecutionChain({ namespace, workflowId, firstRunId }),
  );

  $effect(function loadChain() {
    const loadingChain = chain;
    void loadingChain.load().then(() => redirectToFirstRun(loadingChain));
    return function disposeChain() {
      loadingChain.dispose();
    };
  });

  const redirectToFirstRun = (loadedChain: WorkflowExecutionChain) => {
    const redirectFirstRunId = loadedChain.redirectFirstRunId;
    if (loadedChain !== chain || !redirectFirstRunId) {
      return;
    }
    const route = routeForWorkflowExecutionChain({
      namespace,
      workflow: workflowId,
      firstRunId: redirectFirstRunId,
    });
    void goto(toURL(route, page.url.searchParams), { replaceState: true });
  };

  const filterParams = $derived(parseEventFilterParams(page.url));
  const defaultEventTypes = allEventTypeOptions.map(({ value }) => value);
  const eventTypes = $derived(filterParams.categories ?? defaultEventTypes);

  const onSortChange = (sort: EventSortOrder) => {
    updateEventFilterParams(page.url, { sort }, goto);
  };

  const onCollapseIdleTimeChange = (collapsed: boolean) => {
    $collapseIdleTime = collapsed ? 'on' : 'off';
  };

  const onEventTypeFilterChange = ({
    eventTypes,
    statusFilter,
    allEventTypes,
  }: EventTypeFilterChange) => {
    updateEventFilterParams(
      page.url,
      { categories: allEventTypes ? null : eventTypes, statusFilter },
      goto,
    );
  };

  const pinnedRunId = $derived(page.url.searchParams.get('run') || null);
  const live = $derived(pinnedRunId === null);
  const selectedRunId = $derived(pinnedRunId ?? chain.latestRunId);
  const requestedRun = $derived(
    pinnedRunId ? chain.requestedRuns.get(pinnedRunId) : undefined,
  );

  let runNotice = $state<RunNotice | null>(null);

  const NOTICE_TITLES = {
    notFound: 'workflows.run-not-found-notice',
    wrongChain: 'workflows.run-wrong-chain-notice',
    failed: 'workflows.run-load-failed-notice',
  } as const;

  const setRunParameter = (
    runId: string | null,
    { replaceState = false }: { replaceState?: boolean } = {},
  ) => {
    void updateQueryParameters({
      parameter: 'run',
      value: runId ?? '',
      url: page.url,
      goto,
      options: { ...gotoOptions, replaceState },
    });
  };

  const applyRunParameter = async () => {
    const requestingChain = chain;
    const runId = page.url.searchParams.get('run') || null;
    requestingChain.prioritizeRun(runId);
    if (!runId) {
      return;
    }
    runNotice = null;
    const [requestResult] = await Promise.all([
      requestingChain.requestRun(runId),
      requestingChain.whenLoaded(),
    ]);
    const status = requestResult.status;
    if (
      requestingChain !== chain ||
      !requestingChain.latestRunId ||
      page.url.searchParams.get('run') !== runId ||
      (status !== 'notFound' && status !== 'wrongChain' && status !== 'failed')
    ) {
      return;
    }
    runNotice = { kind: status, runId };
    setRunParameter(null, { replaceState: true });
  };

  afterNavigate(() => void applyRunParameter());

  const onSelect = (runId: string) => {
    if (runId === chain.latestRunId) {
      if (!live) {
        setRunParameter(null);
      }
      return;
    }
    if (runId !== pinnedRunId) {
      setRunParameter(runId);
    }
  };

  const onJumpToLive = () => {
    if (!live) {
      setRunParameter(null);
    }
  };

  const selectedRun = $derived(
    chain.runs.find((run) => run.runId === selectedRunId) ??
      (requestedRun?.status === 'found' ? requestedRun.run : undefined),
  );
  const selectedController = $derived(
    selectedRunId ? chain.controllers.get(selectedRunId) : undefined,
  );
</script>

{#if chain.error}
  <WorkflowChainError {namespace} {workflowId} error={chain.error} />
{:else if chain.mismatch}
  <ChainMismatchWarning
    {namespace}
    {workflowId}
    {firstRunId}
    mismatch={chain.mismatch}
  />
{:else}
  <div class="flex flex-col gap-6">
    <ChainHeader {chain} />
    {#if runNotice}
      <Alert
        intent="warning"
        title={translate(NOTICE_TITLES[runNotice.kind], {
          runId: runNotice.runId,
        })}
        data-testid="run-notice"
      >
        {#if runNotice.kind === 'wrongChain'}
          <Link
            href={routeForWorkflow({
              namespace,
              workflow: workflowId,
              run: runNotice.runId,
            })}>{translate('workflows.view-run')}</Link
          >
        {/if}
      </Alert>
    {/if}
    {#if chain.runs.length === 0 && !selectedController}
      <ChainSkeleton />
    {:else}
      <RunStrip {chain} {selectedRunId} {live} {onSelect} {onJumpToLive} />
    {/if}
    {#if selectedRun && selectedController}
      <WorkflowHistoryProvider controller={selectedController}>
        <WorkflowTimeline
          {namespace}
          workflow={selectedRun.workflow}
          sort={filterParams.sort}
          {onSortChange}
          collapseIdleTime={$collapseIdleTime === 'on'}
          {onCollapseIdleTimeChange}
          {eventTypes}
          failedOrPendingOnly={filterParams.statusFilter}
          {onEventTypeFilterChange}
        />
      </WorkflowHistoryProvider>
    {:else if chain.runs.length > 0 || selectedController}
      <Skeleton class="h-96 rounded-lg" />
    {/if}
  </div>
{/if}
