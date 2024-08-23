<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';

  interface $$Props extends HTMLButtonAttributes {
    copyIconTitle: string;
    copySuccessIconTitle: string;
    copied: boolean;
    'data-testid'?: string;
  }

  export let copyIconTitle: string;
  export let copySuccessIconTitle: string;
  export let copied: boolean;

  let className = '';
  export { className as class };
</script>

<button class={merge('copy-button', className)} on:click {...$$restProps}>
  <Icon
    title={copied ? copySuccessIconTitle : copyIconTitle}
    name={copied ? 'checkmark' : 'copy'}
  />
</button>

<style lang="postcss">
  .copy-button {
    @apply surface-interactive-secondary rounded-md border-2 border-[transparent] bg-transparent p-0.5 opacity-50 hover:opacity-100 focus-visible:border-indigo-600 focus-visible:outline-none dark:text-black dark:hover:text-white;
  }
</style>
