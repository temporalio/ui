<script lang="ts" context="module">
  export const MENU_ITEM_SELECTORS =
    'input, li[role="option"]:not([aria-disabled="true"]), li[role="menuitem"]:not([aria-disabled="true"])';
</script>

<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { MENU_CONTEXT, type MenuContext } from './menu-container.svelte';
  import type { HTMLLiAttributes } from 'svelte/elements';

  type ExtendedLIEvent = KeyboardEvent & {
    currentTarget: EventTarget & HTMLLIElement;
  };

  type ExtendedAnchorEvent = KeyboardEvent & {
    currentTarget: EventTarget & HTMLAnchorElement;
  };

  interface $$Props extends HTMLLiAttributes {
    selected?: boolean;
    destructive?: boolean;
    disabled?: boolean;
    href?: string;
    description?: string;
    'data-testid'?: string;
  }

  export let selected = false;
  export let destructive = false;
  export let disabled = false;
  export let href = null;
  export let description = null;

  const { keepOpen, open } = getContext<MenuContext>(MENU_CONTEXT);

  const dispatch = createEventDispatcher<{ click: undefined }>();

  const handleKeydown = (event: ExtendedLIEvent | ExtendedAnchorEvent) => {
    switch (event.key) {
      case 'Escape':
        $open = false;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        focusNextMenuItem(event.currentTarget);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        focusPreviousMenuItem(event.currentTarget);
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        dispatch('click');
        if (!$keepOpen) $open = false;
        break;
      default:
        break;
    }
  };

  const focusNextMenuItem = (element: HTMLLIElement | HTMLAnchorElement) => {
    let nextElement = element.nextElementSibling;

    while (nextElement) {
      if (nextElement.matches(MENU_ITEM_SELECTORS)) break;
      nextElement = nextElement.nextElementSibling;
    }

    if (nextElement && nextElement instanceof HTMLLIElement) {
      nextElement.focus();
    }
  };

  const focusPreviousMenuItem = (
    element: HTMLLIElement | HTMLAnchorElement,
  ) => {
    let previousElement = element.previousElementSibling;

    while (previousElement) {
      if (previousElement.matches(MENU_ITEM_SELECTORS)) break;
      previousElement = previousElement.previousElementSibling;
    }

    if (previousElement && previousElement instanceof HTMLLIElement) {
      previousElement.focus();
    }
  };

  const handleClick = () => {
    if (!$keepOpen) $open = false;
    dispatch('click');
  };
</script>

{#if href}
  <a
    {href}
    role="menuitem"
    class="menu-item"
    class:disabled
    aria-hidden={disabled ? 'true' : 'false'}
    aria-disabled={disabled}
    tabindex={disabled ? -1 : 0}
    on:keydown={handleKeydown}
    {...$$restProps}
  >
    <slot />
  </a>
{:else}
  <li
    role="menuitem"
    class="menu-item"
    class:destructive
    class:disabled
    aria-hidden={disabled ? 'true' : 'false'}
    aria-disabled={disabled}
    tabindex={disabled ? -1 : 0}
    on:click|preventDefault|stopPropagation={handleClick}
    on:keydown={handleKeydown}
    {...$$restProps}
  >
    <slot name="leading" />
    <div class:selected class="menu-item-wrapper">
      {#if description}
        <div class="flex flex-col gap-1">
          <slot />
          <span class="menu-item-description">
            {description}
          </span>
        </div>
      {:else}
        <slot />
      {/if}
      {#if selected}
        <Icon name="checkmark" />
      {/if}
    </div>
    <slot name="trailing" />
  </li>
{/if}

<style lang="postcss">
  .menu-item {
    @apply cursor-pointer font-primary text-sm font-medium min-h-[40px] p-2 flex flex-row items-center gap-2 rounded hover:bg-indigo-50 focus:bg-indigo-50 focus:outline focus:outline-1 focus:outline-indigo-600 focus:shadow-focus focus:shadow-blue-600/50;
  }

  .menu-item-wrapper {
    @apply flex grow items-center justify-between;
  }

  .menu-item-description {
    @apply text-gray-500 font-normal;
  }

  .selected {
    @apply text-indigo-600;
  }

  .destructive {
    @apply text-red-700 hover:bg-red-50;
  }

  .menu-item.disabled {
    @apply cursor-not-allowed pointer-events-none text-gray-500;
  }
</style>
