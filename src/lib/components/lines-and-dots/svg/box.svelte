<script lang="ts">
  import type { EventClassification } from '$lib/types/events';

  export let point: [number, number];
  export let width: number;
  export let height: number;
  export let classification: EventClassification | undefined = undefined;
  export let fill = '#141414';

  $: [x, y] = point;
</script>

<rect {x} {y} {width} {height} class={classification} {fill}>
  <slot />
</rect>

<style lang="postcss">
  .Failed,
  .Terminated {
    stroke: #ff4518;
  }

  .TimedOut {
    stroke: #f88f49;
  }

  .Canceled {
    stroke: #fff3c6;
  }
</style>
