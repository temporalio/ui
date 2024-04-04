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
    @apply m-1 rounded-md border-2 border-[transparent] bg-transparent text-white hover:bg-slate-800 focus-visible:border-indigo-600 focus-visible:bg-slate-800 focus-visible:outline-none;
  }
</style>
