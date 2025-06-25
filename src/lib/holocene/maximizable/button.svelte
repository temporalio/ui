<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';

  interface Props extends HTMLButtonAttributes {
    maximized: boolean;
    onClick: (e: MouseEvent) => void;
    class?: string;
    'data-testid'?: string;
    'data-theme'?: string;
  }

  let {
    maximized,
    onClick,
    class: className = undefined,
    ...restProps
  }: Props = $props();

  const iconTitle = $derived(maximized ? 'minimize' : 'expand');
  const iconName = $derived(maximized ? 'minimize' : 'expand');
</script>

<button
  class={merge(
    'surface-interactive-secondary m-1 border border-[transparent] bg-transparent p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70',
    className,
  )}
  onclick={onClick}
  {...restProps}
>
  <Icon title={iconTitle} name={iconName} />
</button>
