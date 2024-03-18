<script lang="ts">
  import type { EventTypeCategory } from '$lib/types/events';

  import { TimelineConfig } from '../constants';

  export let point: [number, number] = [0, 0];
  export let category: EventTypeCategory | 'pending' | 'none' | 'icon' = 'none';
  export let active = false;
  export let position: 'start' | 'middle' | 'end' = 'start';

  const { radius } = TimelineConfig;

  let textElement: SVGTextElement;

  $: width = textElement?.getBBox()?.width || 0;

  $: [x, y] = point;
</script>

{#if position === 'middle'}
  <rect
    x={Math.max(0, x - radius / 2)}
    y={y - radius}
    width={width + radius}
    height={radius * 1.33}
    opacity="1"
    fill="#141414"
  />
{/if}
<text
  bind:this={textElement}
  class="cursor-pointer select-none outline-none {category} {position}"
  class:active
  {x}
  {y}
  text-anchor={position === 'end' ? 'end' : 'start'}
>
  <slot />
</text>

<style lang="postcss">
  text {
    fill: #fff;
    font-size: 16px;
    font-weight: 400;
    opacity: 0.25;
    stroke: none;
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

  text.icon {
    fill: #141414;
  }

  text.middle {
    fill: white;
  }
</style>
