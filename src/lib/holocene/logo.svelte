<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import { IconTemporal } from '$lib/io/icon';

  interface Props extends SVGAttributes<SVGElement> {
    width?: number;
    height?: number;
    class?: string;
  }

  let {
    width = 100,
    height = 100,
    class: className = '',
    ...rest
  }: Props = $props();
</script>

<IconTemporal
  {width}
  {height}
  class={merge('fill-current', className)}
  {...rest}
/>
