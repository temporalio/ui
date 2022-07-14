<script lang="ts">
  import { timelineEvents } from '$lib/stores/events';
  import { mouseX } from '$lib/stores/page';
  import { onMount } from 'svelte';
  import { getTimestampDifference } from '$lib/utilities/format-date';
  import { timelineEventTypeOptions } from '$lib/models/event-history/get-event-categorization';
  import type { EventTypeOption } from '$lib/models/event-history/get-event-categorization';

  export let events: WorkflowEvents;
  export let x: number;
  export let type: EventTypeOption;
  export let totalDistance = 1000;
  export let startDate: string;
  export let blockCount;

  let canvas;
  let height = 30;

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
    if (events.length) {
      setTimeout(() => {
        draw();
      }, 0);
    }
  }

  $: {
    if (blockCount) {
      setTimeout(() => {
        draw();
      }, 0);
    }
  }

  $: blockDistance = (totalDistance * (x / totalDistance)) / blockCount;

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

  function drawEvents() {
    const ctx = canvas.getContext('2d');
    Array.from(Array(blockCount).keys()).forEach((block, i) => {
      const start = blockDistance * i;
      const end = start + blockDistance;
      let count = 0;

      for (let event of events) {
        const distance = getDistance(event.eventTime);
        if (distance > start && distance <= end) {
          count = count + 1;
        }
      }

      ctx.fillStyle = count > 0 ? type.color : '#e4e4e7';
      // ctx.globalAlpha = count > 0 ? 0.05 * count : 1;
      if (count > 0) {
        ctx.fillRect(start, height, blockDistance - 2, -height);
        // ctx.fillRect(start, 30, blockDistance - 2, -30);
      }
      if (count >= 1) {
        ctx.fillStyle = '#000';
        ctx.font = `${blockCount < 100 ? '14' : '10'}px Source Sans Pro, Inter`;
        ctx.fillText(
          count.toString(),
          start +
            blockDistance / (blockCount < 50 ? 2 : blockCount < 100 ? 3 : 5),
          20,
        );
      }
    });
  }

  function draw() {
    if (canvas?.getContext) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawEvents();
    }
  }

  const handleClick = (e) => {
    const { x: canvasX } = canvas.getBoundingClientRect();
    const clickedX = e.clientX - canvasX;
    const blockDistance = (totalDistance * (x / totalDistance)) / blockCount;

    const clickedBlockIndex = Array.from(Array(blockCount).keys()).find(
      (_, i) => {
        const start = blockDistance * i;
        const end = start + blockDistance;
        return clickedX > start && clickedX <= end;
      },
    );

    if (clickedBlockIndex >= 0) {
      const startOfBlock = blockDistance * clickedBlockIndex;
      const endOfBlock = startOfBlock + blockDistance;
      $timelineEvents = events.filter((event) => {
        const distance = getDistance(event.eventTime);
        return distance > startOfBlock && distance <= endOfBlock;
      });

      setTimeout(() => {
        draw();
      }, 0);
    }
  };
</script>

{#if events.length}
  <canvas
    bind:this={canvas}
    id="timeline-canvas-{type.option}"
    class="my-2 cursor-pointer p-0"
    width={totalDistance * (x / totalDistance)}
    {height}
    on:click={handleClick}
    on:mousemove={handleMouseMove}
  />
{/if}
