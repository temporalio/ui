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
    'inline-flex flex-wrap items-center gap-2 rounded border border-primary bg-surface-primary p-px',
    className,
  )}
>
  {@render children?.()}
</div>
