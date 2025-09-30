<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { getContext } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { getFocusableElements } from '$lib/utilities/focus-trap';

  import { MENU_CONTEXT, type MenuContext } from './menu-container.svelte';

  interface $$Props extends HTMLAttributes<HTMLUListElement> {
    id: string;
    keepOpen?: boolean;
    position?: 'left' | 'right' | 'top-left' | 'top-right';
    menuElement?: HTMLUListElement;
    maxHeight?: string;
    class?: string;
  }

  let className = '';
  let height = 0;
  export { className as class };
  export let id: string;
  export let keepOpen = false;
  export let position: 'left' | 'right' | 'top-left' | 'top-right' = 'left';
  export let menuElement: HTMLUListElement = null;
  export let maxHeight: string = 'max-h-[20rem]';

  const {
    keepOpen: keepOpenCtx,
    menuElement: menuElementCtx,
    open,
  } = getContext<MenuContext>(MENU_CONTEXT);

  $: $keepOpenCtx = keepOpen;
  $: $menuElementCtx = menuElement;

  $: menuItems = menuElement ? getFocusableElements(menuElement) : [];
  $: lastMenuItem = menuItems[menuItems.length - 1];

  const handleFocusOut = (e: FocusEvent) => {
    if (!$keepOpenCtx && e.target === lastMenuItem) $open = false;
  };

  function portal(
    node: HTMLElement,
    target: HTMLElement | string = document.body,
  ) {
    positionMenuFrom(node, node.previousElementSibling);
    const targetElement =
      typeof target === 'string' ? document.querySelector(target) : target;
    if (targetElement) targetElement.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) node.parentNode.removeChild(node);
      },
    };
  }

  let menuX = 0;
  let menuY = 0;

  const positionMenuFrom = (menuElement: HTMLElement, menuButton: Element) => {
    if (!menuElement || !menuButton) return;
    const button = menuButton.getBoundingClientRect();
    const menu = menuElement.getBoundingClientRect();
    if (position === 'right' || position === 'top-right') {
      menuX = Math.round(button.right) - menu.width;
    }
    if (position === 'left' || position === 'top-left') {
      menuX = Math.round(button.left);
    }

    menuY = Math.round(button.top + button.height);
    if (position === 'top-right' || position === 'top-left') {
      menuY = menuY - menu.height - button.height;
    }
  };
</script>

{#if $open}
  <ul
    role="menu"
    use:portal
    class={merge(
      'surface-primary absolute z-20 mt-1 min-w-fit list-none overflow-auto border border-subtle text-primary shadow',
      'transition-all duration-100 ease-out',
      !$open && 'scale-95 opacity-0',
      $open && 'scale-100 opacity-100',
      maxHeight,
      className,
    )}
    aria-labelledby={id}
    tabindex={-1}
    style={`top: ${menuY}px; left: ${menuX}px;`}
    {id}
    bind:this={menuElement}
    bind:clientHeight={height}
    on:focusout={handleFocusOut}
    on:click|stopPropagation
    {...$$restProps}
  >
    <slot />
  </ul>
{/if}
