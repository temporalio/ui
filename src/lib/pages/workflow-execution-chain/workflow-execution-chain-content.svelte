<script lang="ts">
  import { untrack } from 'svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import WorkflowTimeline from '$lib/components/lines-and-dots/workflow-timeline.svelte';
  import DownloadEventHistoryModal from '$lib/components/workflow/download-event-history-modal.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconDownload } from '$lib/io/icon';
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

  let showDownloadPrompt = $state(false);
</script>

{#if chain.resolution.kind === 'failed'}
  <WorkflowChainError {namespace} {workflowId} error={chain.resolution.error} />
{:else if chain.resolution.kind === 'mismatch'}
  <ChainMismatchWarning
    {namespace}
    {workflowId}
    {firstRunId}
    mismatch={chain.resolution.mismatch}
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
        >
          {#snippet controls()}
            <ToggleButtons>
              <ToggleButton
                data-testid="download"
                LeadingIcon={IconDownload}
                size="sm"
                variant="tertiary"
                onclick={() => (showDownloadPrompt = true)}
              >
                {translate('common.download')}
              </ToggleButton>
            </ToggleButtons>
          {/snippet}
        </WorkflowTimeline>
      </WorkflowHistoryProvider>
      <DownloadEventHistoryModal
        bind:open={showDownloadPrompt}
        {namespace}
        {workflowId}
        runId={selectedRun.runId}
      />
    {:else if chain.runs.length > 0}
      <Skeleton class="h-96 rounded-lg" />
    {/if}
  </div>
{/if}
