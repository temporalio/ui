<script lang="ts">
  import { page } from '$app/stores';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventTypeFilter from '$lib/components/lines-and-dots/event-type-filter.svelte';
  import DownloadEventHistoryModal from '$lib/components/workflow/download-event-history-modal.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import WorkflowHistoryJson from '$lib/pages/workflow-history-json.svelte';
  import { eventFilterSort, eventViewType } from '$lib/stores/event-view';
  import { fullEventHistory, pauseLiveUpdates } from '$lib/stores/events';
  import { eventCategoryFilter } from '$lib/stores/filters';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { EventTypeCategory, WorkflowEvents } from '$lib/types/events';

  export let history: WorkflowEvents;
  export let groups: EventGroups;

  $: ({ namespace } = $page.params);
  $: ({ workflow } = $workflowRun);
  $: reverseSort = $eventFilterSort === 'descending';

  let showFilters = false;
  let showDownloadPrompt = false;

  $: $eventCategoryFilter = $page.url?.searchParams?.get('category')
    ? ($page.url?.searchParams
        ?.get('category')
        .split(',') as EventTypeCategory[])
    : undefined;

  // $: {
  //   console.log('Pending Activities: ', workflow.pendingActivities);
  // }
  // $: formattedPending = workflow.pendingActivities.map((event) => ({
  //   ...event,
  //   id: event.id,
  //   name: 'Pending Activity',
  //   startTime: event.lastStartedTime,
  //   endTime: event.expirationTime,
  //   attributes: {
  //     attempt: event.attempt,
  //     state: event.state,
  //   },
  // }));

  $: compact = $eventViewType === 'compact';
  $: items = compact ? groups : history;
  $: updating = !$fullEventHistory.length;

  const onAllClick = () => {
    $eventViewType = 'feed';
  };

  const onCompactClick = () => {
    $eventViewType = 'compact';
  };

  const onJSONClick = () => {
    $eventViewType = 'json';
  };

  const onSort = () => {
    if (reverseSort) {
      $eventFilterSort = 'ascending';
    } else {
      $eventFilterSort = 'descending';
    }
  };
</script>

<div class="flex flex-col items-center gap-4 md:items-start">
  <div class="flex flex-col items-center gap-2 px-4 md:flex-row md:items-start">
    <div class="flex items-center gap-2 px-4">
      <ToggleButtons>
        <ToggleButton
          active={$eventViewType === 'feed'}
          data-testid="all"
          on:click={onAllClick}>All</ToggleButton
        >
        <ToggleButton
          active={$eventViewType === 'compact'}
          data-testid="compact"
          on:click={onCompactClick}>Compact</ToggleButton
        >
        <ToggleButton
          active={$eventViewType === 'json'}
          data-testid="json"
          on:click={onJSONClick}>JSON</ToggleButton
        >
      </ToggleButtons>
    </div>
    <div class="flex items-center gap-2 px-4">
      <ToggleButtons>
        <ToggleButton
          icon={reverseSort ? 'arrow-down' : 'arrow-up'}
          data-testid="zoom-in"
          on:click={onSort}>{reverseSort ? 'Desc' : 'Asc'}</ToggleButton
        >
      </ToggleButtons>
      <ToggleButtons>
        <ToggleButton
          disabled={!workflow.isRunning}
          icon={$pauseLiveUpdates ? 'play' : 'pause'}
          data-testid="pause"
          tooltip={$pauseLiveUpdates
            ? 'Resume Live Updates'
            : 'Pause Live Updates'}
          on:click={() => ($pauseLiveUpdates = !$pauseLiveUpdates)}
        />
        <ToggleButton
          data-testid="filter"
          icon="filter"
          on:click={() => (showFilters = !showFilters)}
          tooltip={showFilters ? 'Hide Filters' : 'Show Filters'}
        />
        <ToggleButton
          data-testid="download"
          icon="download"
          tooltip="Download Event History"
          on:click={() => (showDownloadPrompt = true)}
        />
      </ToggleButtons>
    </div>
  </div>
  {#if showFilters}
    <div class="flex flex-col items-center justify-center px-4 pb-2">
      <EventTypeFilter {compact} />
    </div>
  {/if}
</div>
{#if $eventViewType === 'json'}
  <div class="px-4">
    <WorkflowHistoryJson />
  </div>
{:else}
  <EventSummaryTable {updating} {items} {groups} {compact} />
{/if}
<DownloadEventHistoryModal
  bind:open={showDownloadPrompt}
  {namespace}
  workflowId={workflow.id}
  runId={workflow.runId}
/>
