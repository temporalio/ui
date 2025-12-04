<script lang="ts" module>
  import { cva } from 'class-variance-authority';

  const menuStyles = cva(
    [
      'surface-primary',
      'absolute',
      'z-20',
      'mt-1',
      'min-w-fit',
      'list-none',
      'overflow-auto',
      'border',
      'border-subtle',
      'text-primary',
      'shadow',
      'w-full',
      'transition-all',
      'duration-100',
      'ease-out',
    ],
    {
      variants: {
        position: {
          left: 'left-0 origin-top-left',
          right: 'right-0 origin-top-right',
          'top-left': 'left-0 origin-top-left',
          'top-right': 'right-0 origin-top-right',
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
    position?: 'left' | 'right' | 'top-left' | 'top-right';
    menuElement?: HTMLUListElement;
    maxHeight?: string;
    class?: ClassNameValue;
  }

  let {
    class: className = '',
    id,
    keepOpen = false,
    position = 'left',
    menuElement = $bindable(null),
    maxHeight = 'max-h-[20rem]',
    children,
    ...rest
  }: Props = $props();

  let height = $state(0);

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
    menuStyles({ position, state: $open ? 'open' : 'closed' }),
  );
</script>

<ul
  role="menu"
  class={merge(styles, maxHeight, className)}
  aria-labelledby={id}
  tabindex={-1}
  style={position === 'top-right' || position === 'top-left'
    ? `top: -${height + 16}px;`
    : ''}
  {id}
  bind:this={menuElement}
  bind:clientHeight={height}
  onfocusout={handleFocusOut}
  onclick={handleClick}
  {...rest}
>
  {@render children?.()}
</ul>
