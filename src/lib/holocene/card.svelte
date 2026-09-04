<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { type ClassNameValue, twMerge } from 'tailwind-merge';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
    class?: ClassNameValue;
    children?: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();
</script>

<div
  class={twMerge(
    'bg-surface-primary text-primary',
    'border',
    'border-primary',
    'rounded-lg',
    'p-4',
    className,
  )}
  {...rest}
>
  {@render children?.()}
</div>
