<script lang="ts">
  import { icons } from './paths';
  import type { IconName } from './paths';

  export let name: IconName;
  export let width = 0;
  export let height = 0;
  export let rotate = 0;
  export let scale = 1;
  export let color = '';
  export let fill = '';
  export let stroke = '';
  export let strokeWidth: string | number = 1.5;

  $: icon = icons[name];

  function getStroke(params: {
    path: svelte.JSX.SVGProps<SVGPathElement>;
    stroke: string;
    color: string;
  }) {
    if (params.path?.stroke === 'none') return '';
    if (color !== '') return params.color;
    if (stroke !== '') return params.stroke;
    return params.path?.stroke ?? '';
  }

  function getFill(params: {
    path: svelte.JSX.SVGProps<SVGPathElement>;
    fill: string;
    color: string;
  }) {
    if (params.path?.fill === 'none') return '';
    if (color !== '') return params.color;
    if (fill !== '') return params.fill;
    return params.path?.fill ?? '';
  }
</script>

{#if icon}
  {@const _width = width !== 0 ? width : icon.width ?? 24}
  {@const _height = height !== 0 ? height : icon.height ?? 24}
  <svg
    width={_width}
    height={_height}
    fill="none"
    class={$$props.class}
    viewBox="0 0 {_width} {_height}"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g
      transform="translate({_width / 2} {_height / 2})"
      transform-origin="{_width / 4} 0"
    >
      <g transform="scale({scale}) rotate({rotate})">
        {#each icon.paths as path (path.d)}
          <path
            {...path}
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width={strokeWidth}
            stroke={getStroke({ path, stroke, color })}
            fill={getFill({ path, fill, color })}
            transform="translate({_width / -2} {_height / -2})"
          />
        {/each}
      </g>
    </g>
  </svg>
{/if}
