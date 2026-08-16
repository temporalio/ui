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
    'surface-primary',
    'border',
    'border-subtle',
    'rounded-panel',
    'p-[var(--panel-inset)]',
    className,
  )}
  {...rest}
>
  {@render children?.()}
</div>
