<script lang="ts" context="module">
  export const MENU_ITEM_SELECTORS =
    'input, li[role="option"]:not([aria-disabled="true"]), li[role="menuitem"]:not([aria-disabled="true"])';
</script>

<script lang="ts">
  import type { HTMLLiAttributes } from 'svelte/elements';

  import { createEventDispatcher, getContext } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';

  import { MENU_CONTEXT, type MenuContext } from './menu-container.svelte';

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
    centered?: boolean;
    class?: string;
    'data-testid'?: string;
    hoverable?: boolean;
  }

  let className = '';
  export { className as class };
  export let selected = undefined;
  export let destructive = false;
  export let disabled = false;
  export let href = null;
  export let description: string = null;
  export let centered = false;
  export let hoverable = true;

  const { keepOpen, open } = getContext<MenuContext>(MENU_CONTEXT);

  const dispatch = createEventDispatcher<{ click: undefined }>();

  const handleKeydown = (event: ExtendedLIEvent | ExtendedAnchorEvent) => {
    switch (event.key) {
      case 'Escape':
        $open = false;
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        focusNextMenuItem(event.currentTarget);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        focusPreviousMenuItem(event.currentTarget);
        break;
      case ' ':
      case 'Enter':
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
    class={merge('menu-item', 'm-1', 'px-3', 'py-2', className)}
    class:disabled
    class:hoverable
    aria-hidden={disabled ? 'true' : 'false'}
    aria-disabled={disabled}
    tabindex={disabled ? -1 : 0}
    on:keydown|stopPropagation={handleKeydown}
    {...$$restProps}
  >
    <slot />
  </a>
{:else}
  <li
    role="menuitem"
    class={merge('menu-item', 'm-1', 'px-3', 'py-2', className)}
    class:destructive
    class:disabled
    class:selected
    aria-hidden={disabled ? 'true' : 'false'}
    aria-disabled={disabled}
    tabindex={disabled ? -1 : 0}
    on:click={handleClick}
    on:keydown|stopPropagation={handleKeydown}
    {...$$restProps}
  >
    <slot name="leading" />
    <div class:centered class="menu-item-wrapper">
      {#if description}
        <div class="flex flex-col">
          <slot />
          <span class="menu-item-description">
            {description}
          </span>
        </div>
      {:else}
        <slot />
      {/if}
      {#if selected !== undefined}
        <div class="flex h-6 w-6 shrink-0">
          {#if selected}
            <Icon name="checkmark" />
          {/if}
        </div>
      {/if}
    </div>
    <slot name="trailing" />
  </li>
{/if}

<style lang="postcss">
  .menu-item {
    @apply flex cursor-pointer flex-row items-center gap-2 rounded border border-transparent text-sm font-medium focus-visible:border-inverse focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/70 dark:focus-visible:border-interactive;

    &.hoverable {
      @apply hover:surface-interactive-secondary focus-visible:surface-interactive-secondary;
    }

    &.selected {
      @apply text-brand;
    }

    &.destructive {
      @apply text-danger;
    }

    &.disabled {
      @apply pointer-events-none cursor-not-allowed opacity-50;
    }
  }

  .menu-item-wrapper {
    @apply flex grow items-center justify-between gap-2;

    &.centered {
      @apply justify-center;
    }
  }

  .menu-item-description {
    @apply text-xs font-normal text-subtle;
  }
</style>
