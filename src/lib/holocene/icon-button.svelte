<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

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
  class="icon-button {className}"
  on:click
  aria-label={label}
  {...$$restProps}
>
  <Icon name={icon} />
</button>

<style lang="postcss">
  .icon-button {
    @apply inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[transparent];

    &:not(:disabled) {
      @apply bg-gradient-to-br hover:border-indigo-600 hover:from-blue-100 hover:to-purple-100 hover:text-gray-900 hover:shadow-focus hover:shadow-indigo-500/50 focus-visible:border-indigo-600 focus-visible:from-blue-100 focus-visible:to-purple-100 focus-visible:text-gray-900 focus-visible:shadow-focus focus-visible:shadow-indigo-500/50 focus-visible:outline-none;
    }

    &:disabled {
      @apply cursor-not-allowed opacity-50;
    }
  }
</style>
