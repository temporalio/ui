<script lang="ts" module>
  import { cva } from 'class-variance-authority';

  const menuStyles = cva(
    [
      'surface-primary',
      'z-20',
      'mt-1',
      'min-w-fit',
      'list-none',
      'overflow-auto',
      'border',
      'border-subtle',
      'text-primary',
      'shadow',
      'transition-all',
      'duration-100',
      'ease-out',
    ],
    {
      variants: {
        position: {
          auto: 'fixed',
          top: 'absolute',
          bottom: 'absolute',
        },
        align: {
          left: 'left-0 origin-top-left',
          right: 'right-0 origin-top-right',
        },
        state: {
          open: 'visible scale-100 opacity-100',
          closed: 'invisible scale-95 opacity-0',
        },
      },
    },
  );
</script>

<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { getContext } from 'svelte';
  import { type ClassNameValue, twMerge as merge } from 'tailwind-merge';

  import { getFocusableElements } from '$lib/utilities/focus-trap';

  import { MENU_CONTEXT, type MenuContext } from './menu-container.svelte';

  export interface Props
    extends Omit<HTMLAttributes<HTMLUListElement>, 'class'> {
    id: string;
    keepOpen?: boolean;
    position?: 'auto' | 'top' | 'bottom';
    align?: 'left' | 'right';
    menuElement?: HTMLUListElement;
    maxHeight?: string;
    class?: ClassNameValue;
    containerId?: string;
  }

  let {
    class: className = '',
    id,
    keepOpen = false,
    position = 'auto',
    align = 'left',
    menuElement = $bindable(null),
    maxHeight = 'max-h-[20rem]',
    children,
    containerId,
    ...rest
  }: Props = $props();

  let height = $state(0);
  let menuPosition = $state({ top: 0, left: 0 });

  const {
    keepOpen: keepOpenCtx,
    menuElement: menuElementCtx,
    open,
  } = getContext<MenuContext>(MENU_CONTEXT);

  $effect(() => {
    $keepOpenCtx = keepOpen;
  });

  $effect(() => {
    $menuElementCtx = menuElement;
  });

  const menuItems = $derived(
    menuElement ? getFocusableElements(menuElement) : [],
  );
  const lastMenuItem = $derived(menuItems[menuItems.length - 1]);

  const handleFocusOut = (e: FocusEvent) => {
    if (!$keepOpenCtx && e.target === lastMenuItem) $open = false;
  };

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  const styles = $derived(
    menuStyles({ align, position, state: $open ? 'open' : 'closed' }),
  );

  const portal = (
    node: HTMLElement,
    target: HTMLElement | string = document.body,
  ) => {
    calculatePosition(node, node.previousElementSibling);
    const targetElement =
      typeof target === 'string' ? document.querySelector(target) : target;
    if (targetElement) targetElement.appendChild(node);
    return {
      destroy() {
        if (node.parentNode) node.parentNode.removeChild(node);
      },
    };
  };

  const calculatePosition = (menu: HTMLElement, anchor: Element) => {
    if (!menu || !anchor) return;

    const rect = anchor.getBoundingClientRect();
    const menuWidth = menu?.offsetWidth;
    const menuHeight = menu?.offsetHeight;

    // Use container bounds if provided, otherwise use window bounds
    const container = document.getElementById(containerId);
    const containerRect = container?.getBoundingClientRect() || {
      left: 0,
      right: window.innerWidth,
      top: 0,
      bottom: window.innerHeight,
    };

    let top = rect.bottom + window.scrollY;
    let left =
      align === 'right'
        ? rect.right + window.scrollX - menuWidth
        : rect.left + window.scrollX;

    if (position === 'top') {
      top = rect.top + window.scrollY - menuHeight - 8;
    } else if (position === 'auto') {
      // Avoid right edge
      if (left + menuWidth > containerRect.right + window.scrollX) {
        left = containerRect.right + window.scrollX - menuWidth - 8;
      }

      // Avoid left edge
      if (left < containerRect.left + window.scrollX) {
        left = containerRect.left + window.scrollX + 8;
      }

      // Avoid bottom edge
      if (top + menuHeight > containerRect.bottom + window.scrollY) {
        top = rect.top + window.scrollY - menuHeight - 8;
      }

      // Avoid top edge
      if (top < containerRect.top + window.scrollY) {
        top = containerRect.top + window.scrollY + 8;
      }
    }

    menuPosition = { top, left };
  };
</script>

{#if $open}
  <ul
    role="menu"
    use:portal
    class={merge(styles, maxHeight, className)}
    aria-labelledby={id}
    tabindex={-1}
    style="top: {menuPosition.top}px; left: {menuPosition.left}px;"
    {id}
    bind:this={menuElement}
    bind:clientHeight={height}
    onfocusout={handleFocusOut}
    onclick={handleClick}
    {...rest}
  >
    {@render children?.()}
  </ul>
{/if}
