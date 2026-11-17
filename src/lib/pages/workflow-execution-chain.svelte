<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import WorkflowTimeline from '$lib/components/lines-and-dots/workflow-timeline.svelte';
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
  import ChainSkeleton from '$lib/workflow-execution-chain/chain-skeleton.svelte';
  import OlderChainWarning from '$lib/workflow-execution-chain/older-chain-warning.svelte';
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
    const current = chain;
    void current.load();
    return function disposeChain() {
      current.dispose();
    };
  });

  $effect(function redirectToFirstRun() {
    const redirectFirstRunId = chain.redirectFirstRunId;
    if (!redirectFirstRunId) {
      return;
    }
    const route = routeForWorkflowExecutionChain({
      namespace,
      workflow: workflowId,
      firstRunId: redirectFirstRunId,
    });
    void goto(toURL(route, page.url.searchParams), { replaceState: true });
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

  const selectedRunId = $derived(chain.latestRunId);
  const selectedRun = $derived(
    chain.runs.find((run) => run.runId === selectedRunId),
  );
  const selectedController = $derived(
    selectedRunId ? chain.controllers.get(selectedRunId) : undefined,
  );
</script>

{#if chain.error}
  <WorkflowChainError {namespace} {workflowId} error={chain.error} />
{:else if chain.olderChain}
  <OlderChainWarning
    {namespace}
    {workflowId}
    {firstRunId}
    olderChain={chain.olderChain}
  />
{:else}
  <div class="flex flex-col gap-6">
    <ChainHeader {chain} />
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
    {:else}
      <ChainSkeleton />
    {/if}
  </div>
{/if}
