<script lang="ts">
  export let x1 = 0;
  export let x2 = 1000;
  export let y = 1000;

  const ticks = 20;

  const strokeWidth = 4;

  $: distance = x2 - x1;
  $: tickDistance = distance / ticks;
</script>

{#each Array(ticks) as _, i}
  <line
    class="line"
    stroke-width={strokeWidth}
    x1={x1 + i * tickDistance}
    x2={x1 + i * tickDistance}
    y1={y - 10}
    y2={y}
  />
{/each}
<line class="line" stroke-width={strokeWidth} {x1} {x2} y1={y} y2={y} />

<style lang="postcss">
  line {
    stroke: #141414;
    fill: #141414;
  }
</style>
