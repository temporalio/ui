<script lang="ts">
  import { timelineEvents } from '$lib/stores/events';
  import { mouseX } from '$lib/stores/page';
  import { onMount } from 'svelte';
  import { getEventColorHex } from '$lib/utilities/get-event-style';
  import { getTimestampDifference } from '$lib/utilities/format-date';

  export let typeEvents: WorkflowEvents;
  export let x: number;
  export let type: string;
  export let totalDistance = 1000;
  export let startDate: string;
  export let blockCount;

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
    if (typeEvents.length) {
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

  function draw() {
    const canvas = document.getElementById(
      `timeline-canvas-${type}`,
    ) as HTMLCanvasElement;
    if (canvas?.getContext) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const blockDistance = (totalDistance * (x / totalDistance)) / blockCount;
      Array.from(Array(blockCount).keys()).forEach((block, i) => {
        const start = blockDistance * i;
        const end = start + blockDistance;
        let count = 0;

        for (let event of typeEvents) {
          const distance = getDistance(event.eventTime);
          if (distance > start && distance <= end) {
            count = count + 1;
          }
        }

        ctx.fillStyle = count > 0 ? getEventColorHex(type) : '#e4e4e7';
        ctx.strokeStyle = count > 0 ? getEventColorHex(type) : '#e4e4e7';
        // ctx.globalAlpha = count > 0 ? 0.05 * count : 1;
        if (count > 0) {
          ctx.fillRect(start, 30, blockDistance - 2, -count);
          // ctx.fillRect(start, 30, blockDistance - 2, -30);
        } else {
          ctx.fillRect(start, 30, blockDistance - 2, -30);
        }
        if (count >= 1) {
          ctx.fillStyle = '#000';
          ctx.font = `${
            blockCount < 100 ? '14' : '10'
          }px Source Sans Pro, Inter`;
          ctx.fillText(
            count.toString(),
            start +
              blockDistance / (blockCount < 50 ? 2 : blockCount < 100 ? 3 : 5),
            20,
          );
        }
      });
    }
  }

  const handleClick = (e) => {
    const canvas = document.getElementById(
      `timeline-canvas-${type}`,
    ) as HTMLCanvasElement;

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
      $timelineEvents = typeEvents.filter((event) => {
        const distance = getDistance(event.eventTime);
        return distance > startOfBlock && distance <= endOfBlock;
      });

      setTimeout(() => {
        draw();
      }, 0);
    }
  };
</script>

{#if typeEvents.length}
  <canvas
    id="timeline-canvas-{type}"
    class="my-2 cursor-pointer p-0"
    width={totalDistance * (x / totalDistance)}
    height={30}
    on:click={handleClick}
    on:mousemove={handleMouseMove}
  />
{/if}
