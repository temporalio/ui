<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

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

<button class="copy-button {className}" on:click {...$$restProps}>
  <Icon
    title={copied ? copySuccessIconTitle : copyIconTitle}
    name={copied ? 'checkmark' : 'copy'}
  />
</button>

<style lang="postcss">
  .copy-button {
    @apply m-1 rounded-md border-2 border-[transparent] hover:border-indigo-600 hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100 hover:shadow-focus hover:shadow-blue-600/50 focus-visible:border-indigo-600 focus-visible:bg-gradient-to-br focus-visible:from-blue-100 focus-visible:to-purple-100 focus-visible:shadow-focus focus-visible:shadow-blue-600/50 focus-visible:outline-none;
  }
</style>
