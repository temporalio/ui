<script lang="ts">
  import type { EventTypeCategory } from '$lib/types/events';

  export let canvasX: number;
  export let y: number = 20;
  export let category: EventTypeCategory;

  const radius = 6;
  const r = (canvasX / 100) * radius;
  const offset = category === 'workflow' ? 0 : (canvasX / 100) * 3 * radius;
  const x = canvasX / 2;
  const strokeWidth = (canvasX / 100) * 2;
</script>

{#if category !== 'workflow'}
  <line
    class="line {category}"
    stroke-width={strokeWidth}
    x1={x}
    x2={x + offset}
    y1={y}
    y2={y}
  />
{/if}
<circle
  stroke-width={strokeWidth}
  class="dot {category}"
  cx={x + offset}
  cy={y}
  {r}
/>

<style lang="postcss">
  .line {
    fill: #10172a;
    opacity: 1;
  }

  .dot {
    opacity: 1;
  }

  .marker,
  .command {
    stroke: #ebebeb;
  }

  .timer {
    stroke: #fbbf24;
  }

  .signal {
    stroke: #ec4899;
  }

  .activity {
    stroke: #a78bfa;
  }

  .child-workflow {
    stroke: #b2f8d9;
  }

  .workflow {
    stroke: #059669;
    fill: #059669;
  }
</style>
