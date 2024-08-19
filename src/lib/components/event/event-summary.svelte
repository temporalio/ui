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
  export let compact = false;

  $: ({ namespace } = $page.params);
  $: ({ workflow } = $workflowRun);
  $: reverseSort = $eventFilterSort === 'descending';

  let showJSON = false;
  let showFilters = false;
  let showDownloadPrompt = false;
  let canvasWidth = 120;

  $: $eventCategoryFilter = $page.url?.searchParams?.get('category')
    ? ($page.url?.searchParams
        ?.get('category')
        .split(',') as EventTypeCategory[])
    : undefined;

  $: items = compact ? groups : history;
  $: updating = !$fullEventHistory.length;

  const onExpandCollapse = () => {
    if (canvasWidth === 120) {
      canvasWidth = 400;
    } else {
      canvasWidth = 120;
    }
  };

  const onAllClick = () => {
    compact = false;
    showJSON = false;
  };

  const onCompactClick = () => {
    compact = true;
    showJSON = false;
  };

  const onJSONClick = () => {
    compact = true;
    showJSON = true;
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
          active={!compact && !showJSON}
          data-testid="all"
          on:click={() => onAllClick()}>All</ToggleButton
        >
        <ToggleButton
          active={compact && !showJSON}
          data-testid="compact"
          on:click={() => onCompactClick()}>Compact</ToggleButton
        >
        <ToggleButton
          active={showJSON}
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
    <div class="flex flex-col items-center justify-center pb-2">
      <EventTypeFilter compact={$eventViewType === 'compact'} />
    </div>
  {/if}
</div>
{#if showJSON}
  <div class="px-4">
    <WorkflowHistoryJson />
  </div>
{:else}
  <EventSummaryTable
    {updating}
    {items}
    {groups}
    {canvasWidth}
    {compact}
    {onExpandCollapse}
  />
{/if}
<DownloadEventHistoryModal
  bind:open={showDownloadPrompt}
  {namespace}
  workflowId={workflow.id}
  runId={workflow.runId}
/>
