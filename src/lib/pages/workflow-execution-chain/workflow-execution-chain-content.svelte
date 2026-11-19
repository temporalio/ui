<script lang="ts">
  import { untrack } from 'svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import WorkflowTimeline from '$lib/components/lines-and-dots/workflow-timeline.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';
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
  import { routeForWorkflowExecutionChain } from '$lib/utilities/route-for';
  import { toURL } from '$lib/utilities/to-url';
  import ChainHeader from '$lib/workflow-execution-chain/chain-header.svelte';
  import ChainMismatchWarning from '$lib/workflow-execution-chain/chain-mismatch-warning.svelte';
  import ChainSkeleton from '$lib/workflow-execution-chain/chain-skeleton.svelte';
  import { RunStrip } from '$lib/workflow-execution-chain/run-strip';
  import WorkflowChainError from '$lib/workflow-execution-chain/workflow-chain-error.svelte';
  import { WorkflowExecutionChain } from '$lib/workflow-execution-chain/workflow-execution-chain.svelte';

  export interface WorkflowExecutionChainProps {
    namespace: string;
    workflowId: string;
    firstRunId: string;
  }

  let { namespace, workflowId, firstRunId }: WorkflowExecutionChainProps =
    $props();

  const chain = new WorkflowExecutionChain(
    // the whole component remount if the identity changes so we do not need to
    // do anything handling of identity change
    untrack(() => ({ namespace, workflowId, firstRunId })),
  );

  $effect(function loadChain() {
    let mounted = true;

    void chain.load().then(({ redirectFirstRunId }) => {
      if (!mounted || !redirectFirstRunId) {
        return;
      }

      void goto(
        toURL(
          routeForWorkflowExecutionChain({
            namespace,
            workflow: workflowId,
            firstRunId: redirectFirstRunId,
          }),
          page.url.searchParams,
        ),
        { replaceState: true },
      );
    });

    return function disposeChain() {
      mounted = false;
      chain.dispose();
    };
  });

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

  let pinnedRunId = $state<string | null>(null);
  const live = $derived(pinnedRunId === null);
  const selectedRunId = $derived(pinnedRunId ?? chain.latestRunId);

  const pin = (runId: string | null) => {
    pinnedRunId = runId;
    chain.prioritizeRun(runId);
  };

  const onSelect = (runId: string) => {
    pin(runId === chain.latestRunId ? null : runId);
  };

  const onJumpToLive = () => {
    pin(null);
  };

  const selectedRun = $derived(
    chain.runs.find((run) => run.runId === selectedRunId),
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
    {#if chain.runs.length === 0}
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
    {:else if chain.runs.length > 0}
      <Skeleton class="h-96 rounded-lg" />
    {/if}
  </div>
{/if}
