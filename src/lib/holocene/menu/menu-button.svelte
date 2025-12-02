<script lang="ts">
  import { getContext, type Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Badge from '$lib/holocene/badge.svelte';
  import type { ButtonStyles } from '$lib/holocene/button.svelte';
  import Button, {
    type ButtonWithoutHrefProps,
  } from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import {
    MENU_CONTEXT,
    type MenuContext,
  } from '$lib/holocene/menu/menu-container.svelte';
  import { MENU_ITEM_SELECTORS } from '$lib/holocene/menu/menu-item.svelte';

  export interface Props extends Omit<ButtonWithoutHrefProps, 'onclick'> {
    controls: string;
    count?: number;
    hasIndicator?: boolean;
    label?: string;
    class?: string;
    active?: boolean;
    size?: ButtonStyles['size'];
    onclick?: (open: boolean) => void;
    leading?: Snippet;
    trailing?: Snippet;
  }

  const {
    controls,
    class: className = '',
    count = 0,
    disabled = false,
    hasIndicator = false,
    id = null,
    label = null,
    variant = 'secondary',
    size = 'md',
    onclick,
    leading,
    trailing,
    children,
    ...rest
  }: Props = $props();

  const { open, menuElement } = getContext<MenuContext>(MENU_CONTEXT);

  const handleClick = () => {
    open.update((previousState) => {
      let newState = previousState;
      if (!disabled) {
        newState = !previousState;
      }

      onclick(newState);
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

<Button
  {id}
  {disabled}
  type="button"
  on:click={handleClick}
  on:keydown={handleKeyDown}
  aria-haspopup={!disabled}
  aria-controls={controls}
  aria-expanded={$open}
  aria-label={label}
  {variant}
  class={merge(className)}
  {size}
  disableTracking={true}
  {...rest}
>
  {@render leading?.()}
  {#if children}
    <div class="flex grow items-center">
      {@render children()}
    </div>
  {/if}
  {#if hasIndicator}
    <div class="flex">
      <Icon
        name="chevron-down"
        class={merge('transition-transform', $open && 'rotate-180')}
      />
    </div>
  {/if}
  {@render trailing?.()}
  {#if count > 0}
    <Badge
      class="absolute right-0 top-0 origin-bottom-left translate-x-[10px] translate-y-[-10px]"
      type="count">{count}</Badge
    >
  {/if}
</Button>
