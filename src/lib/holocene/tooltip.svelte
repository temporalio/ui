<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onDestroy } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Portal from '$lib/holocene/portal/portal.svelte';
  import type {
    PortalOffset,
    PortalPosition,
  } from '$lib/holocene/portal/types';
  import { type IconComponent } from '$lib/io/icon';
  import type { Only } from '$lib/types/global';

  const HOVER_HIDE_DELAY_MS = 120;

  type BaseProps = {
    text?: string;
    Icon?: IconComponent;
    hide?: boolean | null;
    width?: number | null;
    class?: string;
    tooltipClass?: string;
    show?: boolean;
    usePortal?: boolean;
    portalOffset?: PortalOffset;
    scrollContainer?: string;
    children?: Snippet;
    content?: Snippet;
  };

  type BasePositionProps = {
    top?: boolean;
    topRight?: boolean;
    right?: boolean;
    bottomRight?: boolean;
    bottom?: boolean;
    bottomLeft?: boolean;
    left?: boolean;
    topLeft?: boolean;
  };

  type OnlyTop = Only<BasePositionProps, 'top'>;
  type OnlyTopRight = Only<BasePositionProps, 'topRight'>;
  type OnlyRight = Only<BasePositionProps, 'right'>;
  type OnlyBottomRight = Only<BasePositionProps, 'bottomRight'>;
  type OnlyBottom = Only<BasePositionProps, 'bottom'>;
  type OnlyBottomLeft = Only<BasePositionProps, 'bottomLeft'>;
  type OnlyLeft = Only<BasePositionProps, 'left'>;
  type OnlyTopLeft = Only<BasePositionProps, 'topLeft'>;

  type AllUniquePositionProps =
    | OnlyTop
    | OnlyTopRight
    | OnlyRight
    | OnlyBottomRight
    | OnlyBottom
    | OnlyBottomLeft
    | OnlyLeft
    | OnlyTopLeft;

  type Props = BaseProps & AllUniquePositionProps;

  let {
    class: className = '',
    text = '',
    Icon,
    top,
    topRight,
    right,
    bottom,
    bottomLeft,
    bottomRight,
    left,
    topLeft,
    hide = false,
    width = null,
    tooltipClass = '',
    show = false,
    usePortal = false,
    portalOffset,
    scrollContainer,
    children,
    content,
  }: Props = $props();

  let wrapperElement = $state<HTMLElement | null>(null);
  let isHovered = $state(false);
  let isFocused = $state(false);
  let dismissed = $state(false);
  let hoverHideTimer: ReturnType<typeof setTimeout> | null = null;
  const uid = $props.id();
  const tooltipId = `tooltip-${uid}`;

  const isOpen = $derived((show || isHovered || isFocused) && !dismissed);

  $effect(() => {
    if (!isHovered && !isFocused && dismissed) {
      dismissed = false;
    }
  });

  function cancelHide() {
    if (hoverHideTimer) {
      clearTimeout(hoverHideTimer);
      hoverHideTimer = null;
    }
  }

  function handleHoverEnter() {
    cancelHide();
    isHovered = true;
  }

  function handleHoverLeave() {
    cancelHide();
    hoverHideTimer = setTimeout(() => {
      isHovered = false;
      hoverHideTimer = null;
    }, HOVER_HIDE_DELAY_MS);
  }

  function handleWindowKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && isOpen) {
      dismissed = true;
    }
  }

  function isFocusVisible(target: EventTarget | null) {
    if (!(target instanceof Element)) return true;

    try {
      return target.matches(':focus-visible');
    } catch {
      return true;
    }
  }

  function handleFocusIn(event: FocusEvent) {
    if (!isFocusVisible(event.target)) return;

    isFocused = true;
  }

  function handleFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as HTMLElement | null;
    if (next && wrapperElement?.contains(next)) return;
    isFocused = false;
  }

  onDestroy(() => {
    cancelHide();
  });

  const portalPosition = $derived.by((): PortalPosition => {
    if (top) return 'top';
    if (topRight) return 'top-right';
    if (right) return 'right';
    if (bottomRight) return 'bottom-right';
    if (bottom) return 'bottom';
    if (bottomLeft) return 'bottom-left';
    if (left) return 'left';
    if (topLeft) return 'top-left';
    return 'top';
  });
</script>

<svelte:window onkeydowncapture={handleWindowKeydown} />

{#snippet tooltipContent()}
  {#if content}
    {@render content()}
  {:else}
    {#if Icon}<Icon class="inline h-4" />{/if}
    <span>{text}</span>
  {/if}
{/snippet}

{#if hide}
  {@render children?.()}
{:else}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    bind:this={wrapperElement}
    class={merge('wrapper relative inline-block', className)}
    aria-describedby={isOpen ? tooltipId : undefined}
    onmouseenter={handleHoverEnter}
    onmouseleave={handleHoverLeave}
    onfocusin={handleFocusIn}
    onfocusout={handleFocusOut}
  >
    {@render children?.()}

    {#if usePortal && wrapperElement}
      <Portal
        offset={portalOffset}
        anchor={wrapperElement}
        open={isOpen}
        position={portalPosition}
        {scrollContainer}
      >
        <div
          id={tooltipId}
          role="tooltip"
          class={merge(
            'inline-block rounded-md bg-slate-800 px-2 py-2 text-xs text-slate-50',
            tooltipClass,
          )}
          onmouseenter={handleHoverEnter}
          onmouseleave={handleHoverLeave}
          style={width ? `white-space: pre-wrap; width: ${width}px;` : null}
        >
          <div class="flex gap-2">
            {@render tooltipContent()}
          </div>
        </div>
      </Portal>
    {:else}
      <div
        id={tooltipId}
        role="tooltip"
        class={merge(
          'tooltip absolute left-0 top-0 z-50 translate-x-12 whitespace-nowrap text-xs transition-all',
          isOpen ? 'inline-block opacity-95' : 'hidden opacity-0',
        )}
        onmouseenter={handleHoverEnter}
        onmouseleave={handleHoverLeave}
        class:left
        class:right
        class:bottom
        class:bottomLeft
        class:bottomRight
        class:top
        class:topRight
        class:topLeft
        style={width ? `white-space: pre-wrap; width: ${width}px;` : null}
      >
        <div
          class={merge(
            'inline-block rounded-md bg-slate-800 px-2 py-2 text-slate-50',
            tooltipClass,
          )}
        >
          <div class="flex gap-2">
            {@render tooltipContent()}
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style lang="postcss">
  .tooltip.top {
    @apply left-1/2 -mt-2 -translate-x-1/2 -translate-y-full;
  }

  .tooltip.bottom {
    @apply bottom-0 left-1/2 -mb-2 -translate-x-1/2 translate-y-full;
  }

  .tooltip.left {
    @apply left-0 top-[50%] -ml-2 -translate-x-full -translate-y-1/2;
  }

  .tooltip.right {
    @apply right-0 top-[50%] -mr-2 -translate-y-1/2 translate-x-full;
  }

  .tooltip.topRight {
    @apply left-auto right-0 -mt-2 -translate-y-full translate-x-0;
  }

  .tooltip.topLeft {
    @apply left-0 right-auto -mt-2 -translate-y-full translate-x-0;
  }

  .tooltip.bottomLeft {
    @apply bottom-0 left-0 right-auto -mb-2 translate-x-0 translate-y-full;
  }

  .tooltip.bottomRight {
    @apply bottom-0 left-auto right-0 -mb-2 translate-x-0 translate-y-full;
  }
</style>
