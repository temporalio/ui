<script lang="ts">
  export let canvasX: number;
  export let start = 0;
  export let end = 1000;

  const strokeWidth = (canvasX / 100) * 2;
</script>

<line
  class="line"
  stroke-width={strokeWidth}
  x1={canvasX / 2}
  x2={canvasX / 2}
  y1={start}
  y2={end}
/>

<style lang="postcss">
  .line {
    stroke: #059669;
    fill: #059669;
  }
</style>
