<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';

  interface $$Props extends HTMLButtonAttributes {
    copyIconTitle: string;
    copySuccessIconTitle: string;
    copied: boolean;
    'data-testid'?: string;
    'data-theme'?: string;
    class?: string;
  }

  export let copyIconTitle: string;
  export let copySuccessIconTitle: string;
  export let copied: boolean;

  let className = '';
  export { className as class };
</script>

<button
  class={merge(
    'surface-interactive-secondary focus-visible:ring-primary/70 m-1 border border-[transparent] bg-transparent p-1 focus-visible:ring-2 focus-visible:outline-hidden',
    className,
  )}
  on:click
  {...$$restProps}
>
  <Icon
    title={copied ? copySuccessIconTitle : copyIconTitle}
    name={copied ? 'checkmark' : 'copy'}
  />
</button>
