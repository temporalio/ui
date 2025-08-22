<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { fly } from 'svelte/transition';

  import { getContext, tick } from 'svelte';
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

  let {
    class: className = '',
    id,
    keepOpen = false,
    position = 'left' as 'left' | 'right' | 'top-left' | 'top-right',
    menuElement = $bindable(),
    maxHeight = 'max-h-[20rem]',
    ...restProps
  }: $$Props = $props();

  let height = $state(0);
  let width = $state(0);
  let adjustedPosition = $state(position);

  const {
    keepOpen: keepOpenCtx,
    menuElement: menuElementCtx,
    containerElement: containerElementCtx,
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

  const checkEdgeAvoidance = async () => {
    if (!menuElement || !$containerElementCtx) return;

    await tick();

    const menuRect = menuElement.getBoundingClientRect();
    const containerRect = $containerElementCtx.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const _viewportHeight = window.innerHeight;

    let newPosition = position;

    // Check horizontal edge avoidance
    if (position === 'left' || position === 'top-left') {
      if (menuRect.right > viewportWidth) {
        newPosition = position === 'left' ? 'right' : 'top-right';
      }
    } else if (position === 'right' || position === 'top-right') {
      if (menuRect.left < 0) {
        newPosition = position === 'right' ? 'left' : 'top-left';
      }
    }

    // Check vertical edge avoidance for top positions
    if (newPosition === 'top-left' || newPosition === 'top-right') {
      if (containerRect.top - menuRect.height < 0) {
        newPosition = newPosition === 'top-left' ? 'left' : 'right';
      }
    }

    adjustedPosition = newPosition;
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      $open = false;
    }
  };

  $effect(() => {
    if ($open && menuElement) {
      checkEdgeAvoidance();
    }
  });

  $effect(() => {
    if (!$open) return;

    const handleResize = () => {
      checkEdgeAvoidance();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
</script>

<ul
  in:fly={{ duration: 100 }}
  role="menu"
  class={merge('menu', maxHeight, adjustedPosition, className)}
  class:hidden={!$open}
  aria-labelledby={id}
  tabindex={-1}
  style={adjustedPosition === 'top-right' || adjustedPosition === 'top-left'
    ? `top: -${height + 16}px;`
    : ''}
  {id}
  bind:this={menuElement}
  bind:clientHeight={height}
  bind:clientWidth={width}
  onfocusout={handleFocusOut}
  onkeydown={handleKeydown}
  onclick={(e) => e.stopPropagation()}
  {...restProps}
>
  <slot />
</ul>

<style lang="postcss">
  .menu {
    @apply surface-primary absolute z-20 mt-1 min-w-fit list-none overflow-auto border border-subtle text-primary shadow;

    &.left,
    &.top-left {
      @apply left-0 origin-top-left;
    }

    &.right,
    &.top-right {
      @apply right-0 origin-top-right;
    }
  }
</style>
