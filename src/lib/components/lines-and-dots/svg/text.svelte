<script lang="ts">
  import type { EventTypeCategory } from '$lib/types/events';

  import { TimelineConfig } from '../constants';

  export let point: [number, number] = [0, 0];
  export let category: EventTypeCategory | 'pending' | 'none' | 'icon' = 'none';
  export let active = true;
  export let position: 'start' | 'middle' | 'end' = 'start';
  export let fontSize = '16px';

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
  font-size={fontSize}
  text-anchor={position === 'end' ? 'end' : 'start'}
>
  <slot />
</text>

<style lang="postcss">
  text {
    font-weight: 400;
    opacity: 0.25;
    stroke: none;
    fill: #fff;
  }

  text.middle {
    fill: white;
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
</style>
