<script lang="ts">
  export let start = 0;
  export let end = 1000;

  const strokeWidth = 2;
</script>

<line
  class="line"
  stroke-width={strokeWidth}
  x1={50}
  x2={50}
  y1={start}
  y2={end}
/>

<style lang="postcss">
  .line {
    stroke: #059669;
    fill: #059669;
  }
</style>
