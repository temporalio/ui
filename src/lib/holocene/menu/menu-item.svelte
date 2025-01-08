<script lang="ts" module>
  export const MENU_ITEM_SELECTORS =
    'input, li[role="option"]:not([aria-disabled="true"]), li[role="menuitem"]:not([aria-disabled="true"])';
</script>

<script lang="ts">
  import type { HTMLAnchorAttributes, HTMLLiAttributes } from 'svelte/elements';

  import { createEventDispatcher, getContext, type Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';

  import { MENU_CONTEXT, type MenuContext } from './menu-container.svelte';

  type ExtendedLIEvent = KeyboardEvent & {
    currentTarget: EventTarget & HTMLLIElement;
  };

  type ExtendedAnchorEvent = KeyboardEvent & {
    currentTarget: EventTarget & HTMLAnchorElement;
  };

  type BaseProps = {
    selected?: boolean;
    destructive?: boolean;
    disabled?: boolean;
    description?: string;
    centered?: boolean;
    className?: string;
    'data-testid'?: string;
    hoverable?: boolean;
    leading?: Snippet;
    trailingIcon?: Snippet;
  };

  type MenuItemWithoutHrefProps = BaseProps &
    HTMLLiAttributes & {
      href?: never;
      newTab?: never;
    };

  type MenuItemWithHrefProps = BaseProps &
    HTMLAnchorAttributes & {
      href: string;
      newTab?: boolean;
    };

  type $$Props = MenuItemWithoutHrefProps | MenuItemWithHrefProps;

  let {
    className = '',
    selected = undefined,
    destructive = false,
    disabled = false,
    href = null,
    description = null,
    centered = false,
    hoverable = true,
    newTab = false,
    children,
    leading = null,
    trailingIcon = null,
  }: $$Props = $props();

  const { keepOpen, open } = getContext<MenuContext>(MENU_CONTEXT);

  const dispatch = createEventDispatcher<{ click: undefined }>();

  const handleKeydown = (event: ExtendedLIEvent | ExtendedAnchorEvent) => {
    event.stopPropagation();
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
    target={newTab ? '_blank' : null}
    rel={newTab ? 'noreferrer' : null}
    role="menuitem"
    class={merge(
      'menu-item',
      'm-1 px-3 py-2',
      'flex items-center gap-2',
      className,
    )}
    class:disabled
    class:hoverable
    class:justify-center={centered}
    aria-hidden={disabled ? 'true' : 'false'}
    aria-disabled={disabled}
    tabindex={disabled ? -1 : 0}
    onkeydown={handleKeydown}
  >
    {@render children()}
  </a>
{:else}
  <li
    role="menuitem"
    class={merge(
      'menu-item',
      'm-1 px-3 py-2',
      'flex items-center gap-2',
      className,
    )}
    class:destructive
    class:disabled
    class:selected
    class:hoverable
    aria-hidden={disabled ? 'true' : 'false'}
    aria-disabled={disabled}
    tabindex={disabled ? -1 : 0}
    onclick={handleClick}
    onkeydown={handleKeydown}
  >
    {@render leading?.()}
    <div class="grow">
      <div class:centered class="menu-item-wrapper">
        {@render children()}
        {#if selected}
          <Icon name="checkmark" />
        {/if}
      </div>
      {#if description}
        <div class="menu-item-description" class:text-center={centered}>
          {description}
        </div>
      {/if}
    </div>
    {@render trailingIcon?.()}
  </li>
{/if}

<style lang="postcss">
  .menu-item {
    @apply cursor-pointer border border-transparent text-sm font-medium focus-visible:border-inverse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 dark:focus-visible:border-interactive;

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
    @apply flex items-center justify-between gap-2;

    &.centered {
      @apply justify-center;
    }
  }

  .menu-item-description {
    @apply mr-6 text-xs font-normal text-subtle;
  }
</style>
