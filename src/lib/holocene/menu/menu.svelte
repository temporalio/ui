<script lang="ts" module>
  import { cva } from 'class-variance-authority';

  const sharedMenuStyles = [
    'surface-primary',
    'min-w-fit',
    'list-none',
    'overflow-auto',
    'border',
    'border-subtle',
    'text-primary',
    'shadow',
    'w-full',
  ];

  const menuStyles = cva(
    [
      ...sharedMenuStyles,
      'absolute',
      'z-20',
      'mt-1',
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

  import Portal from '$lib/holocene/portal/portal.svelte';
  import type { PortalPosition } from '$lib/holocene/portal/types';
  import { getFocusableElements } from '$lib/utilities/focus-trap';

  import { MENU_CONTEXT, type MenuContext } from './menu-container.svelte';

  export interface Props
    extends Omit<HTMLAttributes<HTMLUListElement>, 'class'> {
    id: string;
    keepOpen?: boolean;
    position?: 'left' | 'right' | 'top-left' | 'top-right';
    menuElement?: HTMLUListElement | null;
    maxHeight?: string;
    class?: ClassNameValue;
    usePortal?: boolean;
    scrollContainer?: string;
  }

  let {
    class: className = '',
    id,
    keepOpen = false,
    position = 'left',
    menuElement = $bindable(null),
    maxHeight = 'max-h-[20rem]',
    usePortal = false,
    scrollContainer,
    children,
    ...rest
  }: Props = $props();

  let height = $state(0);
  let anchorElement = $state<HTMLElement | null>(null);

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

  $effect(() => {
    if (usePortal && id) {
      anchorElement = document.querySelector(
        `[aria-controls="${id}"]`,
      ) as HTMLElement | null;
    }
  });

  const portalPosition: PortalPosition | undefined = $derived.by(() => {
    if (!usePortal) return undefined;
    if (position.includes('top')) return position;

    return position === 'left' ? 'bottom-left' : 'bottom-right';
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

{#snippet menu({ _class, style }: { _class?: string; style?: string })}
  <ul
    role="menu"
    class={_class}
    aria-labelledby={id}
    tabindex={-1}
    {style}
    {id}
    bind:this={menuElement}
    bind:clientHeight={height}
    onfocusout={handleFocusOut}
    onclick={handleClick}
    {...rest}
  >
    {@render children?.()}
  </ul>
{/snippet}

{#if usePortal && anchorElement}
  <Portal
    anchor={anchorElement}
    open={$open}
    position={portalPosition}
    {scrollContainer}
  >
    {@render menu({ _class: merge(sharedMenuStyles, maxHeight, className) })}
  </Portal>
{:else}
  {@render menu({
    _class: merge(styles, maxHeight, className),
    style:
      position === 'top-right' || position === 'top-left'
        ? `top: -${height + 16}px;`
        : undefined,
  })}
{/if}
