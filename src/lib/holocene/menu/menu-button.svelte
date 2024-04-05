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
  import { twMerge as merge } from 'tailwind-merge';

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
  class={merge('menu-button px-4', variant, className)}
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
    @apply relative flex h-10 w-full flex-row items-center gap-2 rounded-lg border py-2.5 text-sm transition-colors transition-shadow focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed;

    &.active {
      @apply after:h-2 after:w-2 after:-translate-x-full after:-translate-y-full after:rounded-full after:bg-blue-300 after:content-[''];
    }
  }

  .primary {
    @apply border-interactive bg-interactive text-inverse hover:border-interactive-hover hover:bg-interactive-hover focus-visible:border-inverse focus-visible:bg-interactive-hover focus-visible:shadow-focus focus-visible:shadow-primary/50;

    &:disabled {
      @apply text-white opacity-75;
    }
  }

  .ghost {
    @apply border-transparent bg-transparent text-primary hover:surface-interactive-secondary focus-visible:surface-interactive-secondary focus-visible:border-inverse focus-visible:shadow-focus focus-visible:shadow-primary/50;

    &:disabled {
      @apply bg-badge/50;
    }
  }

  .secondary {
    @apply border-primary bg-white text-primary hover:surface-interactive-secondary focus-visible:surface-interactive-secondary dark:hover:surface-interactive-secondary hover:border-subtle focus-visible:border-white focus-visible:shadow-focus focus-visible:shadow-secondary dark:bg-transparent dark:hover:border-primary;

    &:disabled {
      @apply bg-slate-50;
    }
  }

  .round {
    @apply w-10 rounded-full p-0;
  }

  .table-header {
    @apply h-auto max-w-fit border-2 border-transparent bg-primary p-0 text-sm text-inverse focus-visible:border-white dark:bg-interactive;
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
