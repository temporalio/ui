<script lang="ts">
  import { formatDate } from '$lib/utilities/format-date';
  import {
    ascendingEventGroups,
    eventGroups,
    events,
  } from '$lib/stores/events';
  import { timeFormat } from '$lib/stores/time-format';
  import { eventSortParam, eventViewType } from '$lib/stores/event-view';
  import { mouseX } from '$lib/stores/page';

  export let x: number;

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

  const getColorHex = (category): string => {
    if (category === 'activity') return '#22c55e';
    // if (category === 'workflow') return '#3b82f6';
    // if (category === 'scheduled') return '#f9a8d4';
    // if (category === 'failed') return '#fca5a5';
    // if (category === 'terminated') return '#dc2626';
    // if (category === 'timedout') return '#f97316';
    if (category === 'timer') return '#facc15';
    if (category === 'marker') return '#6366f1';
    return '#e4e4e7';
  };

  $: startDate = $events[0]?.eventTime;
  $: endDate = $events[$events.length - 1]?.eventTime;

  $: getCurrentTime = (): number => {
    const start = Date.parse(startDate);
    const current = start + $mouseX * (totalDistance / x);
    drawTime();
    return new Date(current);
  };

  function draw() {
    const canvas = document.getElementById('timeline-canvas');
    if (canvas?.getContext) {
      const ctx = canvas.getContext('2d');
      $ascendingEventGroups.forEach((group, i) => {
        console.log('Group: ', group);
        console.log(
          'Start distance: ',
          getDistance(group.eventList[0].eventTime),
        );
        console.log(
          'End distance: ',
          getDistance(group.eventList[group.eventList.length - 1].eventTime),
        );
        ctx.fillStyle = getColorHex(group.category);
        ctx.fillRect(
          getDistance(group.eventList[0].eventTime),
          30 * (i + 1),
          getDistance(group.eventList[group.eventList.length - 1].eventTime),
          -30,
        );
        //   ctx.fillRect(getDistance(event.eventTime), 30 * (i + 1), 1, -30);
        // ctx.fillStyle = '#000';
        // group.eventList.forEach((event) => {
        //   ctx.fillRect(getDistance(event.eventTime), 30 * (i + 1), 1, -30);
        // });
      });
    }
  }

  function drawTime() {
    const canvas = document.getElementById('timeline-canvas');
    if (canvas?.getContext) {
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.lineWidth = '5'; // width of the line
      ctx.strokeStyle = '#000'; // color of the line
      ctx.moveTo($mouseX, 30 * $ascendingEventGroups.length); // begins a new sub-path based on the given x and y values.
      ctx.lineTo($mouseX, 0); // used to create a pointer based on x and y
      ctx.stroke(); // this is where the actual drawing happens.

      // ctx.fillRect(
      //   $mouseX,
      //   30 * $ascendingEventGroups.length,
      //   4,
      //   -30 * $ascendingEventGroups.length,
      // );
    }
  }
</script>

<canvas
  id="timeline-canvas"
  class="border-b border-b-gray-300"
  width={totalDistance * (x / totalDistance) - 210}
  height={30 * ($ascendingEventGroups?.length ?? 1)}
/>
<div class="font-base flex justify-between">
  <small>
    {formatDate(startDate, $timeFormat)}
  </small>
  <small>
    {formatDate(endDate, $timeFormat)}
  </small>
</div>
<h3 class="text-center">{formatDate(getCurrentTime(), $timeFormat)}</h3>
