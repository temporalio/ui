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
  export let icon: IconName = null;
  export let label = '';
</script>

<button type="button" class="icon-button {className}" on:click aria-label={label} {...$$restProps}>
  <Icon name={icon} class="h-auto" />
</button>


<style lang="postcss">
  .icon-button {
    @apply p-1 inline-block rounded-full border-2 border-[transparent];

    &:not(:disabled) {
      @apply bg-gradient-to-br hover:text-gray-900 hover:border-indigo-600 hover:shadow-focus hover:shadow-blue-600/50 hover:from-blue-100 hover:to-purple-100 focus-visible:text-gray-900 focus-visible:outline-none focus-visible:border-indigo-600 focus-visible:shadow-focus focus-visible:shadow-blue-600/50 focus-visible:from-blue-100 focus-visible:to-purple-100
    }

    &:disabled {
      @apply cursor-not-allowed opacity-50;
    }
  }
</style>
