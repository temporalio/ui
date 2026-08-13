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

  const {
    title,
    'aria-label': ariaLabel,
    class: className,
    children,
    ...rest
  }: Props = $props();

  const labelled = $derived(Boolean(title || ariaLabel));
</script>

<svg
  width="1.143em"
  height="1.143em"
  viewBox="0 0 16 16"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  role={labelled ? 'img' : undefined}
  aria-hidden={labelled ? undefined : true}
  aria-label={ariaLabel}
  class={twMerge('shrink-0', className)}
  {...rest}
>
  {#if title && !ariaLabel}
    <title>{title}</title>
  {/if}
  {@render children?.()}
</svg>
