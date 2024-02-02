<script lang="ts">
  import { startingX } from './event-graph.svelte';

  export let y1 = 0;
  export let y2 = 1000;

  const strokeWidth = 2;
</script>

<line
  class="line"
  stroke-width={strokeWidth}
  x1={startingX}
  x2={startingX}
  {y1}
  {y2}
/>

<style lang="postcss">
  .line {
    stroke: #059669;
    fill: #059669;
  }
</style>
