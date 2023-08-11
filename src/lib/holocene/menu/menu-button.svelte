<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { getContext } from 'svelte';
  import { type MenuContext, MENU_CONTEXT } from './menu-container.svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import Badge from '../badge.svelte';
  import { MENU_ITEM_SELECTORS } from './menu-item.svelte';

  interface $$Props extends HTMLButtonAttributes {
    controls: string;
    count?: number;
    disabled?: boolean;
    hasIndicator?: boolean;
    id?: string;
    label?: string;
    unroundRight?: boolean;
    unroundLeft?: boolean;
    variant?: 'default' | 'ghost';
  }

  export let controls: string;
  export let count = 0;
  export let disabled: boolean = false;
  export let hasIndicator: boolean = false;
  export let id: string = null;
  export let label: string = null;
  export let unroundRight = false;
  export let unroundLeft = false;
  export let variant: 'default' | 'ghost' = 'default';

  const { open, menuElement } = getContext<MenuContext>(MENU_CONTEXT);

  const handleClick = () => {
    if (!disabled) {
      $open = !$open;
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        $open = false;
        break;
      case 'ArrowDown':
        event.preventDefault();
        if ($open) {
          focusFirstMenuItem();
        } else {
          $open = true;
        }
        break;
      default:
        break;
    }
  };

  const focusFirstMenuItem = () => {
    const focusable: (HTMLInputElement | HTMLLIElement)[] = Array.from(
      $menuElement.querySelectorAll(MENU_ITEM_SELECTORS),
    );

    if (focusable && focusable[0]) {
      requestAnimationFrame(() => focusable[0].focus());
    }
  };
</script>

<button
  {id}
  {disabled}
  type="button"
  on:click={handleClick}
  on:keydown={handleKeyDown}
  aria-haspopup={!disabled}
  aria-controls={controls}
  aria-expanded={$open}
  aria-label={label}
  class="menu-button {variant}"
  class:unroundLeft
  class:unroundRight
  {...$$restProps}
>
  <slot name="leading" />
  <div class="flex grow">
    <slot />
  </div>
  {#if hasIndicator && !disabled}
    <Icon name={$open ? 'chevron-up' : 'chevron-down'} />
  {:else if disabled}
    <Icon name="lock" />
  {/if}
  <slot name="trailing" />
  {#if count > 0}
    <Badge
      class="absolute top-0 right-0 origin-bottom-left translate-y-[-10px] translate-x-[10px]"
      type="count">{count}</Badge
    >
  {/if}
</button>

<style lang="postcss">
  .menu-button {
    @apply relative text-primary text-sm w-full py-2.5 px-4 h-10 flex flex-row items-center gap-2 rounded-lg disabled:cursor-not-allowed focus-within:border-indigo-600 focus-within:outline-none focus-within:shadow-focus focus-within:shadow-blue-600/50;
  }

  .ghost {
    @apply disabled:bg-gray-100/50;
  }

  .default {
    @apply bg-white border border-primary disabled:bg-gray-50;
  }

  .unroundLeft {
    @apply rounded-l-none;
  }

  .unroundRight {
    @apply rounded-r-none;
  }
</style>
