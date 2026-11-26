<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { twMerge } from 'tailwind-merge';

  interface Props extends Omit<HTMLAttributes<HTMLElement>, 'class'> {
    element?: 'div' | 'nav';
    class?: string;
  }

  let {
    element = 'div',
    class: className,
    children,
    ...rest
  }: Props = $props();
</script>

<svelte:element
  this={element}
  {...rest}
  class={twMerge(
    'inline-flex flex-wrap items-center gap-2 rounded border border-primary bg-surface-primary p-px',
    className,
  )}
>
  {@render children?.()}
</svelte:element>
