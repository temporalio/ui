<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  type ControlledAttribute = 'viewBox' | 'xmlns' | 'role' | 'aria-hidden';

  interface Props extends Omit<
    SVGAttributes<SVGSVGElement>,
    ControlledAttribute
  > {
    children: Snippet;
    title?: string;
    class?: string;
  }

  const { title, class: className, children, ...rest }: Props = $props();
</script>

<svg
  width="1rem"
  height="1rem"
  viewBox="0 0 16 16"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  role={title ? 'img' : undefined}
  aria-hidden={title ? undefined : true}
  class={twMerge('shrink-0', className)}
  {...rest}
>
  {#if title}
    <title>{title}</title>
  {/if}
  {@render children?.()}
</svg>
