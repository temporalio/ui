<script lang="ts">
  import type { EventTypeCategory } from '$lib/types/events';

  export let point: [number, number] = [0, 0];
  export let category: EventTypeCategory | 'pending' | 'none' | undefined =
    undefined;
  export let active = true;
  export let fontSize = '14px';
  export let fontWeight = '400';
  export let textAnchor = 'start';

  $: [x, y] = point;
</script>

<text
  class="cursor-pointer select-none outline-none {category}"
  class:active
  {x}
  {y}
  font-size={fontSize}
  font-weight={fontWeight}
  text-anchor={textAnchor}
>
  <slot />
</text>

<style lang="postcss">
  text {
    opacity: 0.25;
    stroke: none;
    fill: #fff;
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

  text.none {
    fill: #141414;
  }
</style>
