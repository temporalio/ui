<script lang="ts">
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';

  import type { GraphConfig } from '../constants';

  import Line from './line.svelte';

  export let point: [number, number] = [0, 0];
  export let category: string | undefined = undefined;
  export let status: string | undefined = 'none';
  export let fontSize = '14px';
  export let fontWeight = '400';
  export let textAnchor = 'start';
  export let backdrop = false;
  export let backdropHeight = 0;
  export let icon: IconName | undefined = undefined;
  export let config: GraphConfig | undefined = undefined;
  export let label = false;
  export let dark = false;

  $: [x, y] = point;

  let textElement: SVGTextElement;

  $: showIcon = icon && config;
  $: textWidth = textElement?.getBBox()?.width || 0;
  $: backdropWidth = showIcon ? textWidth + 36 : textWidth + 12;
  $: textX = showIcon && textAnchor === 'start' ? x + config.radius * 2 : x;
</script>

{#if backdrop}
  <Line
    startPoint={[x - backdropHeight, y]}
    endPoint={[x + backdropWidth, y]}
    {status}
    strokeWidth={backdropHeight}
  />
{/if}
{#if showIcon && textAnchor === 'start'}
  <Icon
    name={icon}
    {x}
    y={y - 8}
    class={dark ? 'text-black' : !backdrop ? 'text-primary' : 'text-white'}
  />
{/if}
<text
  bind:this={textElement}
  class="cursor-pointer select-none outline-none {category} text-primary"
  class:label
  class:backdrop
  class:dark
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
    {x}
    y={y - 8}
    class={dark ? 'text-black' : !backdrop ? 'text-primary' : 'text-white'}
  />
{/if}

<style lang="postcss">
  text {
    @apply fill-current;

    opacity: 1;
    stroke: none;
    dominant-baseline: middle;
    alignment-baseline: baseline;
  }

  text.backdrop {
    @apply fill-white;
  }

  .label {
    fill: #c9d9f0;
    font-weight: 500;
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
    fill: #67e4f9;
  }

  text.workflow {
    fill: #059669;
  }

  text.Failed {
    fill: #ff4518;
  }

  text.dark,
  text.none {
    fill: theme('colors.space-black');
  }
</style>
