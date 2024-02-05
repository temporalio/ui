<script lang="ts">
  export let x = 0;
  export let y1 = 0;
  export let y2 = 1000;

  const strokeWidth = 2;
</script>

<line class="line" stroke-width={strokeWidth} x1={x} x2={x} {y1} {y2} />

<style lang="postcss">
  .line {
    stroke: #059669;
    fill: #059669;
  }
</style>
