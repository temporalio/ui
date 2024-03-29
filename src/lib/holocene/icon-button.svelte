<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';

  interface $$Props extends HTMLButtonAttributes {
    icon: IconName;
    'data-testid'?: string;
    label: string;
  }

  let className = '';
  export { className as class };
  export let icon: IconName;
  export let label;
</script>

<button
  type="button"
  class={merge('icon-button', className)}
  on:click|stopPropagation
  aria-label={label}
  {...$$restProps}
>
  <Icon name={icon} />
</button>

<style lang="postcss">
  .icon-button {
    @apply inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[transparent];

    &:not(:disabled) {
      @apply text-primary outline-none hover:surface-interactive-secondary focus-visible:surface-interactive-secondary focus-visible:border-indigo-600;
    }

    &:disabled {
      @apply cursor-not-allowed opacity-50;
    }
  }
</style>
