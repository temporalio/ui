<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';

  interface $$Props extends HTMLButtonAttributes {
    expanded: boolean;
    'data-testid'?: string;
    'data-theme'?: string;
  }

  export let expanded: boolean;

  let className = '';
  export { className as class };
</script>

<button
  class={merge(
    'surface-interactive-secondary m-1 border border-[transparent] bg-transparent p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
    className,
  )}
  on:click
  {...$$restProps}
>
  <Icon
    title={expanded ? 'collapse' : 'expand'}
    name={expanded ? 'chevron-up' : 'chevron-down'}
  />
</button>
