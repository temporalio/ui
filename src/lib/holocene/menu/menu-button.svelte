<script lang="ts" context="module">
  export type MenuButtonVariant =
    | 'primary'
    | 'secondary'
    | 'ghost'
    | 'table-header';
</script>

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
    class="flex grow items-center"
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
      class="absolute right-0 top-0 origin-bottom-left translate-x-[10px] translate-y-[-10px]"
      type="count">{count}</Badge
    >
  {/if}
</button>

<style lang="postcss">
  .menu-button {
    @apply relative flex h-10 w-full flex-row items-center gap-2 rounded-lg px-4 py-2.5 text-sm disabled:cursor-not-allowed;

    &.active {
      @apply after:h-2 after:w-2 after:-translate-x-full after:-translate-y-full after:rounded-full after:bg-blue-300 after:content-[''];
    }
  }

  .primary {
    @apply border-2 border-primary bg-primary bg-gradient-to-br text-white hover:border-indigo-600 hover:from-blue-100 hover:to-purple-100 hover:text-primary hover:shadow-focus hover:shadow-blue-600/50 focus-visible:border-indigo-600 focus-visible:from-blue-100 focus-visible:to-purple-100 focus-visible:text-primary focus-visible:shadow-focus focus-visible:shadow-blue-600/50 focus-visible:outline-none;

    &:disabled {
      @apply text-white opacity-75 hover:from-primary hover:to-primary;
    }
  }

  .ghost {
    @apply border border-[transparent] text-primary hover:border-indigo-600 hover:bg-slate-200 hover:shadow-focus hover:shadow-blue-600/50 focus:bg-slate-200 focus:shadow-focus focus:shadow-blue-600/50 focus:outline-1 focus:outline-indigo-600;

    &:disabled {
      @apply bg-slate-100/50;
    }
  }

  .secondary {
    @apply surface-primary border border-primary text-primary;

    &:disabled {
      @apply bg-slate-50;
    }
  }

  .round {
    @apply w-10 rounded-full p-0;
  }

  .secondary,
  .ghost {
    @apply focus-visible:border-indigo-600 focus-visible:shadow-focus focus-visible:shadow-blue-600/50 focus-visible:outline-none;
  }

  .table-header {
    @apply h-auto max-w-fit border-2 border-[transparent] bg-primary p-0 text-sm text-white focus-visible:border-white focus-visible:shadow-focus focus-visible:shadow-blue-600/50 focus-visible:outline-none;
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
