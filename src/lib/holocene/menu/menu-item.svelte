<script lang="ts" context="module">
  export const MENU_ITEM_SELECTORS =
    'input, li[role="option"]:not([aria-disabled="true"]), li[role="menuitem"]:not([aria-disabled="true"])';
</script>

<script lang="ts">
  import type { HTMLAnchorAttributes, HTMLLiAttributes } from 'svelte/elements';

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

  type BaseProps = {
    selected?: boolean;
    destructive?: boolean;
    disabled?: boolean;
    description?: string;
    centered?: boolean;
    class?: string;
    'data-testid'?: string;
    hoverable?: boolean;
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

  let className = '';
  export { className as class };
  export let selected = undefined;
  export let destructive = false;
  export let disabled = false;
  export let href = null;
  export let description: string = null;
  export let centered = false;
  export let hoverable = true;
  export let newTab = false;

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
    on:keydown|stopPropagation={handleKeydown}
    {...$$restProps}
  >
    <div>
      <slot />
    </div>
    {#if newTab}
      <Icon height={20} width={20} name="external-link" slot="trailing" />
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
    on:click={handleClick}
    on:keydown|stopPropagation={handleKeydown}
    {...$$restProps}
  >
    <slot name="leading" />
    <div class="grow">
      <div class:centered class="menu-item-wrapper">
        <slot />
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
    <slot name="trailing" />
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
