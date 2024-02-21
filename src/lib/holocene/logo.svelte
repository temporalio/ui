<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  interface $$Props extends SVGAttributes<SVGElement> {
    width?: string;
    height?: string;
  }

  export let width = '100px';
  export let height = '100px';
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 100 100"
  {width}
  {height}
  class={merge('fill-current stroke-current', $$restProps.class)}
>
  <path
    d="M66 34C64 18 58 5 50 5S36 18 34 34C18 36 5 42 5 50s13 14 29 16c2 16 8 29 16 29s14-13 16-29c16-2 29-8 29-16S82 36 66 34ZM34 61C18 59 9 54 9 50s9-9 25-11a123 123 0 0 0 0 22ZM50 9c4 0 9 9 11 25a123 123 0 0 0-22 0c2-16 7-25 11-25Zm16 52-4 1-1 4c-2 16-7 25-11 25s-9-9-11-25a218 218 0 0 1-1-16V38a120 120 0 0 1 28 1c16 2 25 7 25 11s-9 9-25 11Z"
  />
</svg>
