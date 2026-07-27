<script lang="ts">
  import { onDestroy } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Portal from '$lib/holocene/portal/portal.svelte';
  import type { PortalPosition } from '$lib/holocene/portal/types';
  import type { Only } from '$lib/types/global';

  const HOVER_HIDE_DELAY_MS = 120;

  type BaseProps = {
    text?: string;
    icon?: IconName;
    hide?: boolean;
    width?: number;
    class?: string;
    tooltipClass?: string;
    show?: boolean;
    usePortal?: boolean;
    scrollContainer?: string;
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

  type $$Props = BaseProps & AllUniquePositionProps;

  let className = '';
  export { className as class };
  export let text = '';
  export let icon: IconName = null;
  /** bottom center of the tooltip aligned to the top center of the wrapper */
  export let top = false;
  /** bottom right of the tooltip aligned to the top right of the wrapper */
  export let topRight = false;
  /** left center of the tooltip aligned to the right center of the wrapper */
  export let right = false;
  /** top center of the tooltip aligned to the bottom center of the wrapper */
  export let bottom = false;
  /** top left of the tooltip aligned to the bottom left of the wrapper */
  export let bottomLeft = false;
  /** top right of the tooltip aligned to the bottom right of the wrapper */
  export let bottomRight = false;
  /** right center of the tooltip aligned to the left center of the wrapper */
  export let left = false;
  /** bottom left of the tooltip aligned to the top left of the wrapper   */
  export let topLeft = false;
  export let hide: boolean | null = false;
  export let width: number | null = null;
  export let tooltipClass = '';
  export let show = false;
  export let usePortal = false;
  export let scrollContainer: string | undefined = undefined;

  let wrapperElement: HTMLElement | null = null;
  let isHovered = false;
  let isFocused = false;
  let dismissed = false;
  let hoverHideTimer: ReturnType<typeof setTimeout> | null = null;
  const tooltipId = `tooltip-${crypto.randomUUID()}`;

  $: isOpen = (show || isHovered || isFocused) && !dismissed;

  $: if (!isHovered && !isFocused && dismissed) {
    dismissed = false;
  }

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

  function handleFocusIn() {
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

  $: portalPosition = ((): PortalPosition => {
    if (top) return 'top';
    if (topRight) return 'top-right';
    if (right) return 'right';
    if (bottomRight) return 'bottom-right';
    if (bottom) return 'bottom';
    if (bottomLeft) return 'bottom-left';
    if (left) return 'left';
    if (topLeft) return 'top-left';
    return 'top';
  })();
</script>

<svelte:window on:keydown|capture={handleWindowKeydown} />

{#if hide}
  <slot />
{:else}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    bind:this={wrapperElement}
    class={merge('wrapper relative inline-block', className)}
    aria-describedby={isOpen ? tooltipId : undefined}
    on:mouseenter={handleHoverEnter}
    on:mouseleave={handleHoverLeave}
    on:focusin={handleFocusIn}
    on:focusout={handleFocusOut}
  >
    <slot />

    {#if usePortal && wrapperElement}
      <Portal
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
          on:mouseenter={handleHoverEnter}
          on:mouseleave={handleHoverLeave}
          style={width ? `white-space: pre-wrap; width: ${width}px;` : null}
        >
          <div class="flex gap-2">
            <slot name="content">
              {#if icon}<Icon name={icon} class="inline h-4" />{/if}
              <span>{text}</span>
            </slot>
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
        on:mouseenter={handleHoverEnter}
        on:mouseleave={handleHoverLeave}
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
            <slot name="content">
              {#if icon}<Icon name={icon} class="inline h-4" />{/if}
              <span>{text}</span>
            </slot>
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
