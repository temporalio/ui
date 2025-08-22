<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte';
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

  interface $$Props extends ButtonWithoutHrefProps {
    controls: string;
    count?: number;
    hasIndicator?: boolean;
    label?: string;
    class?: string;
    active?: boolean;
    size?: ButtonStyles['size'];
  }

  let className = '';
  export { className as class };
  export let controls: string;
  export let count = 0;
  export let disabled = false;
  export let hasIndicator = false;
  export let id: string = null;
  export let label: string = null;
  export let variant: ButtonStyles['variant'] = 'secondary';
  export let size: ButtonStyles['size'] = 'md';

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
  {...$$restProps}
>
  <slot name="leading" />
  <div class="flex grow items-center" class:hidden={!$$slots.default}>
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
</Button>
