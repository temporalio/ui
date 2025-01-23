<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    label: string;
    class?: string;
  }

  let { label, class: className = '', children, ...rest }: Props = $props();
</script>

<div
  class={merge('tab-list', className)}
  role="tablist"
  aria-label={label}
  {...rest}
>
  {@render children?.()}
</div>

<style lang="postcss">
  .tab-list {
    @apply flex flex-row gap-4;
  }
</style>
