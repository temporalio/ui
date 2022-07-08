<script lang="ts">
  import { formatDate } from '$lib/utilities/format-date';
  import { activeEvent, events } from '$lib/stores/events';
  import { timeFormat } from '$lib/stores/time-format';
  import { eventSortParam, eventViewType } from '$lib/stores/event-view';
  import { mouseX } from '$lib/stores/page';

  export let type: string;
  export let x: number;
  export let showDateRange = false;

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

    const diff = dateDiff($events[0]?.eventTime, date1);
    return diff * ((x - 212) / totalDistance);
  };

  let totalDistance = 0;

  $: {
    if ($events.length) {
      totalDistance = dateDiff(
        $events[0]?.eventTime,
        $events[$events.length - 1]?.eventTime,
      );
      setTimeout(() => {
        draw();
      }, 10);
    }
  }

  const getColor = (): string => {
    if (type === 'completed') return 'bg-green-500';
    if (type === 'started') return 'bg-blue-500';
    if (type === 'scheduled') return 'bg-pink-300';
    if (type === 'failed') return 'bg-red-300';
    if (type === 'terminated') return 'bg-red-600';
    if (type === 'timedout') return 'bg-orange-500';
    if (type === 'canceled') return 'bg-yellow-400';
    if (type === 'marker') return 'bg-indigo-500';
    return 'bg-gray-200';
  };

  const getColorHex = (): string => {
    if (type === 'completed') return '#22c55e';
    if (type === 'started') return '#3b82f6';
    if (type === 'scheduled') return '#f9a8d4';
    if (type === 'failed') return '#fca5a5';
    if (type === 'terminated') return '#dc2626';
    if (type === 'timedout') return '#f97316';
    if (type === 'canceled') return '#facc15';
    if (type === 'marker') return '#6366f1';
    return '#e4e4e7';
  };

  $: startDate = $events[0]?.eventTime;
  $: endDate = $events[$events.length - 1]?.eventTime;
  $: midDate = new Date(
    new Date(endDate) - (new Date(endDate) - new Date(startDate)) / 2,
  );

  $: getCurrentTime = (): number => {
    const start = Date.parse(startDate);
    const current = start + $mouseX - 138;
    return new Date(current);
  };

  function draw() {
    const canvas = document.getElementById(`canvas-${type}`);
    if (canvas?.getContext) {
      const ctx = canvas.getContext('2d');
      typeEvents.forEach((event) => {
        ctx.fillStyle = getColorHex();
        ctx.fillRect(getDistance(event.eventTime), 30, 2, -30);
      });
    }
  }
</script>

{#if typeEvents.length}
  <section class="my-1 w-full">
    <h3 class="my-2 text-sm">
      <div class="w-2  h-2 inline-block rounded-full {getColor()}" />
      {type} ({typeEvents.length})
    </h3>
    <canvas
      id="canvas-{type}"
      class="border-b border-b-gray-300"
      width={totalDistance * (x / totalDistance) - 210}
      height="30"
    />
  </section>
{/if}
{#if showDateRange}
  <div class="font-base flex justify-between">
    <small>
      {formatDate(startDate, $timeFormat)}
    </small>
    <small>
      {formatDate(endDate, $timeFormat)}
    </small>
  </div>
  <h3 class="text-center">{formatDate(getCurrentTime(), $timeFormat)}</h3>
{/if}
