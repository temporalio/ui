<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { twMerge } from 'tailwind-merge';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'class'> {
    class?: string;
  }

  let { class: className, children, ...rest }: Props = $props();
</script>

<div
  {...rest}
  class={twMerge(
    'inline-flex items-center gap-1 rounded-full bg-surface-tertiary p-1 text-primary',
    className,
  )}
>
  {@render children?.()}
</div>
