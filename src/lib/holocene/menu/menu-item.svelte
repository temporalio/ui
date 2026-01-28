<script lang="ts" module>
  export const MENU_ITEM_SELECTORS =
    'input, li[role="option"]:not([aria-disabled="true"]), li[role="menuitem"]:not([aria-disabled="true"])';
</script>

<script lang="ts">
  import type {
    HTMLAnchorAttributes,
    HTMLLiAttributes,
    KeyboardEventHandler,
  } from 'svelte/elements';

  import { getContext, type Snippet } from 'svelte';
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';

  import { MENU_CONTEXT, type MenuContext } from './menu-container.svelte';

  export interface BaseProps {
    selected?: boolean;
    destructive?: boolean;
    disabled?: boolean;
    description?: string;
    centered?: boolean;
    class?: ClassNameValue;
    hoverable?: boolean;
    onclick?: () => void;
    children?: Snippet;
    leading?: Snippet;
    trailing?: Snippet;
  }

  export interface MenuItemWithoutHrefProps
    extends BaseProps, Omit<HTMLLiAttributes, 'class' | 'onclick'> {
    href?: never;
    newTab?: never;
  }

  interface MenuItemWithHrefProps
    extends BaseProps, Omit<HTMLAnchorAttributes, 'class' | 'onclick'> {
    href: string;
    newTab?: boolean;
  }

  type Props = MenuItemWithoutHrefProps | MenuItemWithHrefProps;

  const {
    class: className,
    selected,
    destructive = false,
    disabled = false,
    href = null,
    description = null,
    centered = false,
    hoverable = true,
    newTab = false,
    onclick,
    children,
    leading,
    trailing,
    ...rest
  }: Props = $props();

  const { keepOpen, open } = getContext<MenuContext>(MENU_CONTEXT);

  const handleKeydown: KeyboardEventHandler<
    HTMLLIElement | HTMLAnchorElement
  > = (event) => {
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
        onclick?.();
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
    onclick?.();
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
      centered ? 'justify-center' : 'justify-between',
      className,
    )}
    class:disabled
    class:hoverable
    aria-hidden={disabled ? 'true' : 'false'}
    aria-disabled={disabled}
    tabindex={disabled ? -1 : 0}
    data-track-name="menuitem"
    data-track-intent="navigate"
    data-track-text="*textContent*"
    onkeydown={handleKeydown}
    {...rest as HTMLAnchorAttributes}
  >
    <div>
      {@render children?.()}
    </div>
    {#if newTab}
      <Icon height={20} width={20} name="external-link" />
    {/if}
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
    data-track-name="menuitem"
    data-track-intent="action"
    data-track-text="*textContent*"
    onkeydown={handleKeydown}
    onclick={handleClick}
    {...rest as HTMLLiAttributes}
  >
    {@render leading?.()}
    <div class="grow">
      <div class:centered class="menu-item-wrapper">
        {@render children?.()}
        {#if selected}
          <Icon name="checkmark" class="shrink-0" />
        {/if}
      </div>
      {#if description}
        <div class="menu-item-description" class:text-center={centered}>
          {description}
        </div>
      {/if}
    </div>
    {@render trailing?.()}
  </li>
{/if}

<style lang="postcss">
  .menu-item {
    @apply cursor-pointer border border-transparent text-sm focus-visible:border-inverse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 dark:focus-visible:border-interactive;

    &.hoverable {
      @apply hover:surface-interactive-secondary focus-visible:surface-interactive-secondary;
    }

    &.selected {
      @apply bg-brand/10 text-brand;
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
    @apply mr-6 text-xs font-normal text-secondary;
  }
</style>
