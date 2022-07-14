<script lang="ts">
  import { timelineEvents } from '$lib/stores/events';
  import { mouseX } from '$lib/stores/page';
  import { onMount } from 'svelte';
  import { getTimestampDifference } from '$lib/utilities/format-date';
  import { timelineEventTypeOptions } from '$lib/models/event-history/get-event-categorization';

  export let eventGroups: EventGroups;
  export let x: number;
  export let totalDistance = 1000;
  export let startDate: string;
  export let blockCount: number;

  let width = totalDistance * (x / totalDistance);
  let canvas;
  let height = 100;
  let blockHeight = 20;

  onMount(() => {
    function onResize() {
      setTimeout(() => {
        draw();
      }, 0);
    }

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  });

  $: {
    if (eventGroups.length) {
      height = eventGroups.length * blockHeight;
      setTimeout(() => {
        draw();
      }, 0);
    }
  }

  function handleMouseMove(event) {
    $mouseX = event.clientX;
  }

  const getDistance = (currentDate): number => {
    if (!currentDate) {
      return 0;
    }

    const diff = getTimestampDifference(startDate, currentDate);
    return diff * (x / totalDistance);
  };

  function drawAxis() {
    const ctx = canvas.getContext('2d');
    const gridGap = 5;

    // no of vertical grid lines
    var num_lines_x = Math.floor(height / blockCount);

    for (var i = 0; i <= blockCount; i++) {
      ctx.beginPath();
      ctx.lineWidth = 1;

      // If line represents X-axis draw in different color
      if (i == num_lines_x) ctx.strokeStyle = '#000000';
      else ctx.strokeStyle = '#e9e9e9';

      if (i == num_lines_x) {
        ctx.moveTo(0, blockCount * i);
        ctx.lineTo(width, blockCount * i);
      } else {
        ctx.moveTo(0, blockCount * i + 0.5);
        ctx.lineTo(width, blockCount * i + 0.5);
      }
      ctx.stroke();
    }
  }

  function drawGroups() {
    const ctx = canvas.getContext('2d');

    for (let group of eventGroups) {
      const index = eventGroups.indexOf(group);
      const startDistance = getDistance(group.initialEvent.eventTime);
      const endDistance = getDistance(group.lastEvent.eventTime);
      const duration = endDistance - startDistance;
      const typeOption = timelineEventTypeOptions.find(
        (o) => o.option == group.category,
      );
      if (duration > 0) {
        ctx.fillStyle = typeOption ? typeOption.color : '#e4e4e7';
        ctx.fillRect(startDistance, blockHeight * index, duration, blockHeight);
        ctx.font = `14px Source Sans Pro, Inter`;
        ctx.fillText(
          group.name,
          endDistance + 3,
          blockHeight * index + blockHeight - 5,
        );
      }
    }
  }

  function draw() {
    if (canvas?.getContext) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawAxis();
      drawGroups();
    }
  }

  const handleClick = (e) => {
    const { x: canvasX, y: canvasY } = canvas.getBoundingClientRect();
    const clickedX = e.clientX - canvasX;
    const clickedY = e.clientY - canvasY;
    for (let group of eventGroups) {
      const index = eventGroups.indexOf(group);
      const startDistance = getDistance(group.initialEvent.eventTime);
      const endDistance = getDistance(group.lastEvent.eventTime);
      const inX = clickedX > startDistance && clickedX <= endDistance;
      const inY =
        clickedY > index * blockHeight && clickedY <= (index + 1) * blockHeight;
      if (inX && inY) {
        $timelineEvents = group.eventList;
      }
    }
  };
</script>

{#if eventGroups.length}
  <canvas
    bind:this={canvas}
    id="timeline-group-canvas"
    class="my-2 cursor-pointer p-0"
    {width}
    {height}
    on:click={handleClick}
    on:mousemove={handleMouseMove}
  />
{/if}
