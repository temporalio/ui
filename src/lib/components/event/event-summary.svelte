<script lang="ts">
  import { page } from '$app/stores';

  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Pagination from '$lib/holocene/pagination.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroups } from '$lib/models/event-groups/event-groups';
  import WorkflowHistoryJson from '$lib/pages/workflow-history-json.svelte';
  import { expandAllEvents } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';
  import { eventCategoryFilter } from '$lib/stores/filters';
  import type { EventTypeCategory, WorkflowEvents } from '$lib/types/events';

  import HistoryGraph from '../lines-and-dots/svg/history-graph.svelte';

  import EventEmptyRow from './event-empty-row.svelte';

  export let history: WorkflowEvents;
  export let groups: EventGroups;
  export let compact = false;

  let showJSON = false;
  let canvasWidth = 120;

  function handleExpandChange(event: CustomEvent) {
    $expandAllEvents = event.detail.expanded;
  }

  $: $eventCategoryFilter = $page.url?.searchParams?.get('category')
    ? ($page.url?.searchParams
        ?.get('category')
        .split(',') as EventTypeCategory[])
    : undefined;

  $: initialItem = $fullEventHistory?.[0];
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
</script>

<Pagination
  floatId="event-view-toggle"
  {items}
  {updating}
  let:visibleItems
  let:activeRowIndex
  let:setActiveRowIndex
  aria-label={translate('workflows.event-history')}
  pageSizeSelectLabel={translate('common.per-page')}
  previousButtonLabel={translate('common.previous')}
  nextButtonLabel={translate('common.next')}
>
  <svelte:fragment slot="action-top-center">
    <div class="flex flex-col items-center md:items-start">
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
  </svelte:fragment>
  <div class="flex gap-0">
    {#if !compact && !showJSON}
      <div
        class="relative hidden pt-12 lg:block"
        style="width: {canvasWidth}px;"
      >
        <Button
          size="xs"
          variant="ghost"
          class="absolute right-1 top-1"
          on:click={onExpandCollapse}
        >
          <Icon
            name={canvasWidth === 120 ? 'chevron-right' : 'chevron-left'}
            x={4}
            y={8}
          />
        </Button>
        <HistoryGraph {groups} history={visibleItems} {canvasWidth} />
      </div>
    {/if}
    <div class="w-full">
      {#if showJSON}
        <WorkflowHistoryJson />
      {:else}
        <EventSummaryTable {updating} on:expandAll={handleExpandChange}>
          {#each visibleItems as event, index (`${event.id}-${event.timestamp}`)}
            <EventSummaryRow
              {event}
              {compact}
              expandAll={$expandAllEvents === 'true'}
              {initialItem}
              active={activeRowIndex === index}
              onRowClick={() => setActiveRowIndex(index)}
            />
          {:else}
            <EventEmptyRow loading={!$fullEventHistory.length} />
          {/each}
        </EventSummaryTable>
      {/if}
    </div>
  </div>
</Pagination>
