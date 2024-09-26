<script lang="ts">
  import { page } from '$app/stores';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventTypeFilter from '$lib/components/lines-and-dots/event-type-filter.svelte';
  import DownloadEventHistoryModal from '$lib/components/workflow/download-event-history-modal.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import WorkflowHistoryJson from '$lib/pages/workflow-history-json.svelte';
  import {
    eventFilterSort,
    eventViewType,
    expandAllEvents,
  } from '$lib/stores/event-view';
  import { fullEventHistory, pauseLiveUpdates } from '$lib/stores/events';
  import { eventCategoryFilter } from '$lib/stores/filters';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type {
    EventTypeCategory,
    IterableEventWithPending,
  } from '$lib/types/events';

  import EventStatusFilter from '../lines-and-dots/event-status-filter.svelte';

  export let history: IterableEventWithPending[];
  export let groups: EventGroups;

  let showDownloadPrompt = false;

  $: ({ namespace } = $page.params);
  $: ({ workflow } = $workflowRun);
  $: reverseSort = $eventFilterSort === 'descending';
  $: updating = !$fullEventHistory.length;
  $: compact = $eventViewType === 'compact';
  $: expandAll = $expandAllEvents === 'true';

  $: $eventCategoryFilter = $page.url?.searchParams?.get('category')
    ? ($page.url?.searchParams
        ?.get('category')
        .split(',') as EventTypeCategory[])
    : undefined;

  $: pendingActivities = workflow.pendingActivities;
  $: pendingNexusOperations = workflow.pendingNexusOperations;

  $: items = compact
    ? groups
    : reverseSort
    ? [...pendingNexusOperations, ...pendingActivities, ...history]
    : [...history, ...pendingActivities, ...pendingNexusOperations];

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

  const onExpandAll = () => {
    if (expandAll) {
      $expandAllEvents = 'false';
    } else {
      $expandAllEvents = 'true';
    }
  };
</script>

<div
  class="flex flex-col items-center justify-between gap-4 py-4 lg:flex-row lg:py-8"
>
  <div class="flex flex-col items-center gap-2 px-4 md:flex-row">
    <div class="flex items-center gap-2 px-4">
      <ToggleButtons>
        <ToggleButton
          active={$eventViewType === 'feed'}
          data-testid="feed"
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
      {#if $eventViewType !== 'json'}
        <ToggleButtons>
          <ToggleButton
            icon={reverseSort ? 'arrow-down' : 'arrow-up'}
            data-testid="zoom-in"
            on:click={onSort}>{reverseSort ? 'Desc' : 'Asc'}</ToggleButton
          >
          <ToggleButton
            icon={expandAll ? 'chevron-up' : 'chevron-down'}
            data-testid="expandAll"
            tooltip={expandAll ? 'Collapse All Events' : 'Expand All Events'}
            on:click={onExpandAll}
          />
        </ToggleButtons>
      {/if}
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
          data-testid="download"
          icon="download"
          tooltip="Download Event History"
          on:click={() => (showDownloadPrompt = true)}
        />
      </ToggleButtons>
    </div>
  </div>
  <div
    class="flex w-full flex-col items-center justify-end gap-4 px-4 lg:flex-row"
  >
    {#if $eventViewType !== 'json'}
      <EventStatusFilter />
    {/if}
    <EventTypeFilter {compact} />
  </div>
</div>
{#if $eventViewType === 'json'}
  <div class="px-4">
    <WorkflowHistoryJson />
  </div>
{:else}
  <div data-testid="event-summary-table">
    <EventSummaryTable {updating} {items} {groups} {compact} />
  </div>
{/if}
<DownloadEventHistoryModal
  bind:open={showDownloadPrompt}
  {namespace}
  workflowId={workflow.id}
  runId={workflow.runId}
/>
