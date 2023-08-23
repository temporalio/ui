<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';
  
  import { createEventDispatcher, getContext } from 'svelte';
  
  import Badge from '$lib/holocene/badge.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import {
    MENU_CONTEXT,
    type MenuContext,
  } from '$lib/holocene/menu/menu-container.svelte';
  import { MENU_ITEM_SELECTORS } from '$lib/holocene/menu/menu-item.svelte';

  type MenuButtonVariant = 'primary' | 'secondary' | 'ghost' | 'table-header';

  interface $$Props extends HTMLButtonAttributes {
    controls: string;
    count?: number;
    disabled?: boolean;
    hasIndicator?: boolean;
    id?: string;
    label?: string;
    unround?: boolean;
    unroundRight?: boolean;
    unroundLeft?: boolean;
    variant?: MenuButtonVariant;
    class?: string;
    active?: boolean;
    round?: boolean;
    'data-testid'?: string;
  }

  let className = '';
  export { className as class };
  export let controls: string;
  export let count = 0;
  export let disabled = false;
  export let hasIndicator = false;
  export let id: string = null;
  export let label: string = null;
  export let unround = false;
  export let unroundRight = false;
  export let unroundLeft = false;
  export let variant: MenuButtonVariant = 'secondary';
  export let active = false;
  export let round = false;

  const dispatch = createEventDispatcher<{ click: { open: boolean } }>();
  const { open, menuElement } = getContext<MenuContext>(MENU_CONTEXT);

  const handleClick = () => {
    open.update((previousState) => {
      let newState = previousState;
      if (!disabled) {
        newState = !previousState;
      }

      dispatch('click', { open: newState });
      return newState;
    });
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
  on:click|stopPropagation|preventDefault={handleClick}
  on:keydown={handleKeyDown}
  aria-haspopup={!disabled}
  aria-controls={controls}
  aria-expanded={$open}
  aria-label={label}
  class="menu-button {variant} {className}"
  class:unroundLeft
  class:unroundRight
  class:active
  class:unround
  class:round
  {...$$restProps}
>
  <slot name="leading" />
  <div
    class="flex items-center grow"
    class:justify-center={round}
    class:hidden={!$$slots.default}
  >
    <slot />
  </div>
  {#if hasIndicator}
    <div class="flex">
      <Icon name={$open ? 'chevron-up' : 'chevron-down'} />
    </div>
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
    @apply relative text-sm w-full h-10 py-2.5 px-4 flex flex-row items-center gap-2 rounded-lg disabled:cursor-not-allowed focus:z-50;

    &.active {
      @apply after:content-[''] after:rounded-full after:h-2 after:w-2 after:bg-blue-300 after:-translate-x-full after:-translate-y-full;
    }
  }

  .primary {
    @apply border-2 border-primary bg-primary bg-gradient-to-br text-white hover:from-blue-100 hover:to-purple-100 hover:text-primary;

    &:disabled {
      @apply text-white opacity-75 hover:from-primary hover:to-primary;
    }
  }

  .ghost {
    @apply text-primary border border-[transparent] hover:bg-gray-200 hover:border-indigo-600 hover:shadow-focus hover:shadow-blue-600/50 focus:bg-gray-200 focus:outline-1 focus:outline-indigo-600 focus:shadow-focus focus:shadow-blue-600/50;

    &:disabled {
      @apply bg-gray-100/50;
    }
  }

  .secondary {
    @apply bg-white text-primary border border-primary;

    &:disabled {
      @apply bg-gray-50;
    }
  }

  .round {
    @apply w-10 p-0 rounded-full;
  }

  .secondary,
  .ghost {
    @apply focus-within:border-indigo-600 focus-within:outline-none focus-within:shadow-focus focus-within:shadow-blue-600/50;
  }

  .table-header {
    @apply p-0 max-w-fit text-sm;
  }

  .unround {
    @apply rounded-none;
  }

  .unroundLeft {
    @apply rounded-l-none;
  }

  .unroundRight {
    @apply rounded-r-none;
  }
</style>
