<script lang="ts">
  import type { SVGAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  interface Props extends SVGAttributes<SVGSVGElement> {
    children: Snippet;
    title?: string;
    class?: string;
  }

  const { title, class: className, children, ...rest }: Props = $props();
</script>

<svg
  width="1em"
  height="1em"
  viewBox="0 0 16 16"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  role={title ? 'img' : undefined}
  aria-hidden={title ? undefined : true}
  focusable="false"
  class={twMerge('shrink-0 align-[-0.125em]', className)}
  {...rest}
>
  {#if title}
    <title>{title}</title>
  {/if}
  {@render children?.()}
</svg>
