<script lang="ts">
  import * as _ from 'lodash';

  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { CATEGORIES } from '$lib/models/event-history/get-event-categorization';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { eventHistory, fullEventHistory } from '$lib/stores/events';
  import { eventCategoryFilter, eventStatusFilter } from '$lib/stores/filters';
  import type {
    CommonHistoryEvent,
    EventTypeCategory,
  } from '$lib/types/events';
  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';

  import NorthStarTimeRow from './north-star-time-row.svelte';

  const getEventGroups = (
    items: CommonHistoryEvent[],
    category: string,
    status: string,
  ): EventGroup[] => {
    let filteredItems = [...items];
    if (category) {
      filteredItems = filteredItems.filter((i) => {
        if (category === CATEGORIES.LOCAL_ACTIVITY) {
          return isLocalActivityMarkerEvent(i);
        }
        return i.category === category;
      });
    }

    const groups = groupEvents(filteredItems, $eventFilterSort);
    if (status) {
      return groups.filter((group) => {
        return group.status === status;
      });
    }
    return groups;
  };

  $: category = $eventCategoryFilter as EventTypeCategory;
  $: status = $eventStatusFilter;
  $: currentEvents = $fullEventHistory.length
    ? $fullEventHistory
    : $eventHistory?.start;
  $: items = getEventGroups(currentEvents, category, status);
  $: parallelItems = _.groupBy(items, (x) => x.initialEvent.timestamp);
</script>

<div class="flex h-auto max-h-[600px] flex-col gap-2 overflow-auto py-2">
  {#each Object.entries(parallelItems) as [date, group]}
    <NorthStarTimeRow {date} {group} />
  {:else}
    <div
      class="flex w-full items-center gap-4 rounded-lg border-2 border-gray-900 bg-white px-3 py-2 pl-8"
    >
      <p>{translate('events.empty-state-title')}</p>
    </div>
  {/each}
</div>
