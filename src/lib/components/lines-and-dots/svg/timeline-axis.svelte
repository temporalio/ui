<script lang="ts">
  import Line from './line.svelte';

  export let x1 = 0;
  export let x2 = 1000;
  export let y = 1000;

  const ticks = 20;

  $: distance = x2 - x1;
  $: tickDistance = distance / ticks;
</script>

{#each Array(ticks) as _, i}
  <Line
    strokeWidth={4}
    startPoint={[x1 + i * tickDistance, y - 10]}
    endPoint={[x1 + i * tickDistance, y]}
  />
{/each}

<style lang="postcss">
  line {
    stroke: #141414;
    fill: #141414;
  }
</style>
