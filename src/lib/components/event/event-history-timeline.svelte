<script lang="ts">
  import { ascendingEvents, filteredEvents } from '$lib/stores/events';
  import { mouseX } from '$lib/stores/page';
  import { onMount } from 'svelte';
  import { getEventColorHex } from '$lib/utilities/get-event-style';

  export let x: number;
  export let type: string;

  let blockCount = 100;
  let totalDistance = 1000;

  $: typeEvents = $ascendingEvents.filter((e) => e.eventType.includes(type));

  function handleMouseMove(event) {
    $mouseX = event.clientX;
  }

  const dateDiff = (date1, date2): number => {
    if (!date1 || !date2) {
      return 0;
    }
    const parse1 = Date.parse(date1);
    const parse2 = Date.parse(date2);
    return Math.abs(parse1 - parse2);
  };

  const getDistance = (date1): number => {
    if (!date1) {
      return 0;
    }

    const diff = dateDiff($ascendingEvents[0]?.eventTime, date1);
    return diff * (x / totalDistance);
  };

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
    if ($ascendingEvents.length) {
      totalDistance = dateDiff(
        $ascendingEvents[0]?.eventTime,
        $ascendingEvents[$ascendingEvents.length - 1]?.eventTime,
      );
      setTimeout(() => {
        draw();
      }, 0);
    }
  }

  function draw() {
    const canvas = document.getElementById(
      `timeline-canvas-${type}`,
    ) as HTMLCanvasElement;
    if (canvas?.getContext) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const blockDistance = (totalDistance * (x / totalDistance)) / 100;
      Array.from(Array(blockCount).keys()).forEach((block, i) => {
        const start = blockDistance * i;
        const end = start + blockDistance;
        let count = 0;
        let active = false;

        for (let event of typeEvents) {
          const distance = getDistance(event.eventTime);
          if (distance > start && distance <= end) {
            count = count + 1;
            if ($filteredEvents?.find((e) => e.id === event.id)) {
              active = true;
            }
          }
        }

        ctx.fillStyle = count > 0 ? getEventColorHex(type) : '#e4e4e7';
        ctx.fillRect(start, 30, blockDistance - 2, -30);
        // if (count > 1) {
        // ctx.fillStyle = '#000';
        // ctx.fillText('+', start + blockDistance / 4, 18);
        // }
      });
    }
  }

  const handleClick = (e) => {
    const clickedX = e.clientX - 139;
    const blockDistance = (totalDistance * (x / totalDistance)) / 100;
    const clickedBlock = Array.from(Array(blockCount).keys()).filter(
      (block, i) => {
        const start = blockDistance * i;
        const end = start + blockDistance;
        if (clickedX > start && clickedX <= end) {
          return block;
        }
      },
    );

    const activeIndex = clickedBlock[0];
    if (activeIndex) {
      const startOfBlock = blockDistance * activeIndex;
      const endOfBlock = startOfBlock + blockDistance;
      $filteredEvents = typeEvents.filter((event) => {
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
