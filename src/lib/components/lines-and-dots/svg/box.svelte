<script lang="ts">
  export let point: [number, number];
  export let width: number;
  export let height: number;
  export let classification: string | undefined = undefined;
  export let fill = '#141414';

  $: [x, y] = point;
</script>

<rect {x} {y} {width} {height} class={classification} {fill}>
  <slot />
</rect>

<style lang="postcss">
  .Failed,
  .Terminated {
    stroke: #ff4418;
    stroke-width: 3;
  }

  .TimedOut {
    stroke: #f88f49;
    stroke-width: 3;
  }

  .Canceled {
    stroke: #fff3c6;
    stroke-width: 3;
  }

  .active {
    fill: #1e293b;
  }

  .pending,
  .retry {
    stroke: #a78bfa;
    stroke-width: 3;
    stroke-dasharray: 3;
  }

  .retry {
    stroke: #c71607;
  }
</style>
