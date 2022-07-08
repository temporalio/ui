<script lang="ts">
  import { formatDate } from '$lib/utilities/format-date';
  import { activeEvent, events } from '$lib/stores/events';
  import { timeFormat } from '$lib/stores/time-format';
  import { eventSortParam, eventViewType } from '$lib/stores/event-view';

  export let type: string;
  export let x: number;
  export let showDateRange = false;

  $: data = {};

  $: typeEvents = $events.filter((e) =>
    e.eventType.toLowerCase().includes(type),
  );

  const dateDiff = (date1, date2): number => {
    if (!date1 || !date2) {
      return 0;
    }
    const parse1 = Date.parse(date1);
    const parse2 = Date.parse(date2);
    return Math.abs(parse1 - parse2);
  };

  $: getDistance = (date1): number => {
    if (!date1) {
      return 0;
    }

    return (
      dateDiff(
        $events[$eventSortParam === 'descending' ? typeEvents.length - 1 : 0]
          ?.eventTime,
        date1,
      ) *
      ((x - 212) / totalDistance)
    );
  };

  $: totalDistance = 100;

  $: {
    if (typeEvents.length) {
      totalDistance = dateDiff(
        $events[0]?.eventTime,
        typeEvents[typeEvents.length - 1]?.eventTime,
      );
      typeEvents.forEach((e) => {
        data[formatDate(e.eventTime, $timeFormat)] = 50;
      });
    }
  }

  const getColor = (): string => {
    if (type === 'completed') return 'bg-green-500';
    if (type === 'started') return 'bg-indigo-600';
    if (type === 'scheduled') return 'bg-pink-300';
    if (type === 'failed') return 'bg-red-300';
    if (type === 'terminated') return 'bg-red-600';
    if (type === 'timedout') return 'bg-orange-500';
    if (type === 'canceled') return 'bg-yellow-400';
    if (type === 'marker') return 'bg-blue-500';
    return 'bg-gray-200';
  };

  $: startDate = $events[0]?.eventTime;
  $: endDate = $events[$events.length - 1]?.eventTime;
  $: midDate = new Date(
    new Date(endDate) - (new Date(endDate) - new Date(startDate)) / 2,
  );
</script>

{#if typeEvents.length}
  <section class="my-1 w-full">
    <div class="relative h-4 border-b border-b-gray-300">
      {#each typeEvents as event}
        <div
          class="absolute h-4 cursor-pointer {getColor()}"
          style="left: {getDistance(event.eventTime)}px; width: 3px;"
          on:click={() => {
            if ($activeEvent?.id === event.id) {
              $activeEvent = null;
            } else {
              $activeEvent = event;
            }
          }}
        />
      {/each}
    </div>
    <h3 class="mt-1 text-sm">{type} ({typeEvents.length})</h3>
  </section>
{/if}
{#if showDateRange}
  <div class="font-base flex justify-between">
    <small>
      {formatDate(startDate, $timeFormat)}
    </small>
    <small>
      {formatDate(midDate, $timeFormat)}
    </small>
    <small>
      {formatDate(endDate, $timeFormat)}
    </small>
  </div>
{/if}
