<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  interface $$Props extends HTMLAttributes<HTMLDivElement> {
    label: string;
    class?: string;
  }

  export let label: string;
  let className = '';
  export { className as class };
</script>

<div
  class={merge('tab-list', className)}
  role="tablist"
  aria-label={label}
  {...$$restProps}
>
  <slot />
</div>

<style lang="postcss">
  .tab-list {
    @apply flex flex-row gap-4;
  }
</style>
