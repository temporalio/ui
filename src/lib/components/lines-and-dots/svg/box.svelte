<script lang="ts">
  import type { Snippet } from 'svelte';

  type Props = {
    point: [number, number];
    width: number;
    height: number;
    classification?: string;
    fill?: string;
    children?: Snippet;
  };

  let {
    point,
    width,
    height,
    classification = undefined,
    fill = '#141414',
    children,
  }: Props = $props();

  const [x, y] = $derived(point);
</script>

<rect {x} {y} {width} {height} class={classification} {fill}>
  {@render children?.()}
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
