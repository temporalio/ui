<script lang="ts">
  import type { EventTypeCategory } from '$lib/types/events';

  export let point: [number, number] = [0, 0];
  export let category: EventTypeCategory | 'pending' | 'none' = 'none';
  export let active = false;
  export let textAnchor: 'start' | 'end' = 'start';

  $: [x, y] = point;
</script>

<text
  class="cursor-pointer select-none outline-none {category}"
  class:active
  {x}
  {y}
  text-anchor={textAnchor}
>
  <slot />
</text>

<style lang="postcss">
  text {
    fill: white;
    font-size: 16px;
    font-weight: 400;
    opacity: 0.25;
    stroke: none;
  }

  .none {
    font-size: 14px;
    fill: #aebed9;
  }

  .active {
    opacity: 1;
  }

  text.marker,
  .command {
    fill: #ebebeb;
  }

  text.timer {
    fill: #fbbf24;
  }

  text.signal {
    fill: #ec4899;
  }

  text.activity {
    fill: #a78bfa;
  }

  text.pending {
    fill: #a78bfa;
  }

  text.child-workflow {
    fill: #b2f8d9;
  }

  text.workflow {
    fill: #059669;
  }
</style>
