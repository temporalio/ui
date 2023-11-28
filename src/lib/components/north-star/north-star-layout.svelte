<script lang="ts">
  import * as _ from 'lodash';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Spinner from '$lib/holocene/icon/svg/spinner.svelte';
  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { CATEGORIES } from '$lib/models/event-history/get-event-categorization';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { eventHistory, fullEventHistory } from '$lib/stores/events';
  import { eventCategoryFilter } from '$lib/stores/filters';
  import type {
    CommonHistoryEvent,
    EventTypeCategory,
  } from '$lib/types/events';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';

  import NorthStarInputAndResult from './north-star-input-and-result.svelte';
  import NorthStarTimeRow from './north-star-time-row.svelte';

  const getEventGroups = (
    items: CommonHistoryEvent[],
    category: string,
  ): EventGroup[] => {
    if (category) {
      const filteredItems = items.filter((i) => {
        if (category === CATEGORIES.LOCAL_ACTIVITY) {
          return isLocalActivityMarkerEvent(i);
        }
        return i.category === category;
      });
      return groupEvents(filteredItems, $eventFilterSort);
    }
    return groupEvents(items, $eventFilterSort);
  };

  $: category = $eventCategoryFilter as EventTypeCategory;
  $: currentEvents = $fullEventHistory.length
    ? $fullEventHistory
    : $eventHistory?.start;
  $: items = getEventGroups(currentEvents, category);
  $: parallelItems = _.groupBy(items, (x) => x.initialEvent.timestamp);
  $: workflowEvents =
    getWorkflowStartedCompletedAndTaskFailedEvents($eventHistory);

  let inputInline = true;
  let resultInline = true;
</script>

<div class="border-l-8 border-gray-900">
  <div class="my-4 flex flex-col gap-2">
    <div class="flex items-center items-stretch gap-0">
      <p
        class="py-auto flex flex-col justify-center bg-gray-900 px-2.5 font-mono text-white"
      >
        Input
      </p>
      <NorthStarInputAndResult
        inline={inputInline}
        content={workflowEvents.input}
        data-testid="workflow-input"
      />
      <button
        on:click={() => (inputInline = !inputInline)}
        class="py-auto flex flex-col justify-center rounded-r-lg bg-gray-900 px-2.5 font-mono text-white"
      >
        <Icon name={inputInline ? 'chevron-down' : 'chevron-up'} />
      </button>
    </div>
    <div class="flex flex-col gap-2 px-6 py-2">
      {#each Object.entries(parallelItems) as [date, timeGroup]}
        <NorthStarTimeRow
          {date}
          categorizedGroups={_.groupBy(timeGroup, (group) => group.category)}
        />
      {/each}
    </div>
    <div class="flex items-center items-stretch gap-0">
      <p
        class="py-auto flex flex-col justify-center bg-gray-900 px-2.5 font-mono text-white"
      >
        {#if workflowEvents.results}
          Results
        {:else}
          <Spinner class="h-6 w-6 animate-spin" />
        {/if}
      </p>
      <NorthStarInputAndResult
        inline={resultInline}
        content={workflowEvents.results}
        data-testid="workflow-results"
      />
      <button
        on:click={() => (resultInline = !resultInline)}
        class="py-auto flex flex-col justify-center rounded-r-lg bg-gray-900 px-2.5 font-mono text-white"
      >
        <Icon name={resultInline ? 'chevron-down' : 'chevron-up'} />
      </button>
    </div>
  </div>
</div>
