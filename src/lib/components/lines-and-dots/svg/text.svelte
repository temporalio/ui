<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { type IconName } from '$lib/holocene/icon/paths';

  import type { GraphConfig } from '../constants';

  import Line from './line.svelte';

  export let point: [number, number] = [0, 0];
  export let category: string | undefined = undefined;
  export let active = true;
  export let fontSize = '14px';
  export let fontWeight = '400';
  export let textAnchor = 'start';
  export let backdrop = false;
  export let backdropHeight = 0;
  export let icon: IconName | undefined = undefined;
  export let config: GraphConfig | undefined = undefined;

  $: [x, y] = point;

  let textElement: SVGTextElement;

  $: showIcon = icon && config;
  $: textWidth = textElement?.getBBox()?.width || 0;
  $: backdropWidth = showIcon ? textWidth + 36 : textWidth + 12;
  $: textX = showIcon && textAnchor === 'start' ? x + config.radius * 2.25 : x;
</script>

{#if backdrop}
  <Line
    startPoint={[x - backdropHeight, y]}
    endPoint={[x + backdropWidth, y]}
    {active}
    status="none"
    strokeWidth={backdropHeight}
  />
{/if}
{#if showIcon && textAnchor === 'start'}
  <Icon
    name={icon}
    {x}
    y={y - config.radius}
    width={config.radius * 2}
    height={config.radius * 2}
    class="text-white {!active && 'opacity-[.35]'}"
  />
{/if}
<text
  bind:this={textElement}
  class="cursor-pointer select-none outline-none {category}"
  class:active
  x={textX}
  {y}
  font-size={fontSize}
  font-weight={fontWeight}
  text-anchor={textAnchor}
>
  <slot />
</text>
{#if showIcon && textAnchor === 'end'}
  <Icon
    name={icon}
    x={x - textWidth - config.radius * 2}
    y={y - config.radius}
    width={config.radius * 2}
    height={config.radius * 2}
    class="text-white {!active && 'opacity-[.35]'}"
  />
{/if}

<style lang="postcss">
  text {
    opacity: 0.25;
    stroke: none;
    fill: #fff;
    dominant-baseline: middle;
    alignment-baseline: baseline;
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
