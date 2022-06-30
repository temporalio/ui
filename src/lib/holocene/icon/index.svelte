<script lang="ts">
  import { icons } from './paths';
  import type { IconName } from './paths';

  export let name: IconName;
  export let width = 24;
  export let height = 24;
  export let rotate = 0;
  export let scale = 1;
  export let color = '';
  export let fill = '';
  export let stroke = '';
  export let strokeWidth: string | number = 1.5;

  $: icon = icons[name];

  function getStroke(path: svelte.JSX.SVGProps<SVGPathElement>) {
    if (path?.stroke === 'none') return '';
    if (color !== '') return color;
    if (stroke !== '') return stroke;
    return path?.stroke ?? '';
  }

  function getFill(path: svelte.JSX.SVGProps<SVGPathElement>) {
    if (path?.fill === 'none') return '';
    if (color !== '') return color;
    if (fill !== '') return fill;
    return path?.fill ?? '';
  }
</script>

{#if icon}
  <svg
    {width}
    {height}
    fill="none"
    class={$$props.class}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g
      transform="translate({width / 2} {height / 2})"
      transform-origin="{width / 4} 0"
    >
      <g transform="scale({scale}) rotate({rotate})">
        {#each icon.paths as path (path.d)}
          <path
            {...path}
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width={strokeWidth}
            stroke={getStroke(path)}
            fill={getFill(path)}
            transform="translate({width / -2} {height / -2})"
          />
        {/each}
      </g>
    </g>
  </svg>
{/if}
