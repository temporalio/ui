<script lang="ts">
  import { on } from 'svelte/events';
  import { scale } from 'svelte/transition';

  import { untrack } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { portal } from './portal-action';
  import { calculatePosition, getElementRect } from './position-calculator';
  import type { PortalProps } from './types';

  let {
    anchor,
    open = true,
    position = 'bottom',
    offset = {},
    target = document.body,
    hideWhenAnchorHidden = true,
    scrollContainer = window,
    flipOnCollision = true,
    class: className = '',
    children,
  }: PortalProps = $props();

  let portalElement = $state<HTMLElement | undefined>(undefined);
  let isVisible = $state(true);
  let positionX = $state(0);
  let positionY = $state(0);
  let anchorElement = $state<HTMLElement | null>(null);
  let scrollContainerElement = $state<HTMLElement | Window>(window);
  let rafId = $state<number | null>(null);

  const shouldShowPortal = $derived(
    open && anchorElement && (!hideWhenAnchorHidden || isVisible),
  );

  $effect(function resolveAnchorElement() {
    if (typeof anchor === 'string') {
      anchorElement = document.getElementById(anchor) as HTMLElement | null;
    } else {
      anchorElement = anchor;
    }
  });

  $effect(function resolveScrollContainerElement() {
    if (typeof scrollContainer === 'string') {
      const element = document.getElementById(
        scrollContainer,
      ) as HTMLElement | null;
      scrollContainerElement = element || window;
    } else {
      scrollContainerElement = scrollContainer;
    }
  });

  $effect(function updateAnchorVisibility() {
    if (!anchorElement || !hideWhenAnchorHidden) {
      isVisible = true;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry.isIntersecting;
      },
      {
        threshold: 0,
        root:
          scrollContainerElement !== window
            ? (scrollContainerElement as HTMLElement)
            : null,
      },
    );

    observer.observe(anchorElement);

    return () => {
      observer.disconnect();
    };
  });

  function updatePosition() {
    if (!portalElement || !anchorElement) return;

    const anchorRect = getElementRect(anchorElement);
    const portalRect = getElementRect(portalElement);

    const containerRect =
      scrollContainerElement !== window
        ? getElementRect(scrollContainerElement as HTMLElement)
        : undefined;

    const result = calculatePosition(
      anchorRect,
      portalRect,
      position,
      offset,
      flipOnCollision,
      containerRect,
    );

    const roundedX = Math.round(result.x);
    const roundedY = Math.round(result.y);

    if (positionX !== roundedX) positionX = roundedX;
    if (positionY !== roundedY) positionY = roundedY;
  }

  function scheduleUpdate() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(() => {
      updatePosition();
      rafId = null;
    });
  }

  function getScrollableAncestors(element: HTMLElement): Set<EventTarget> {
    const ancestors = new Set<EventTarget>([document]);
    let parent = element.parentElement;

    while (parent) {
      const { overflow, overflowX, overflowY } =
        window.getComputedStyle(parent);
      const isScrollable = [overflow, overflowX, overflowY].some(
        (val) => val === 'auto' || val === 'scroll' || val === 'overlay',
      );

      if (isScrollable) ancestors.add(parent);
      parent = parent.parentElement;
    }

    return ancestors;
  }

  function setupPositioning(element: HTMLElement) {
    if (!anchorElement) return;

    untrack(() => updatePosition());

    const resizeObserver = new ResizeObserver(() => {
      scheduleUpdate();
    });

    resizeObserver.observe(element);
    resizeObserver.observe(anchorElement);

    const scrollableAncestors = getScrollableAncestors(anchorElement);

    const scrollCleanup = on(
      document,
      'scroll',
      (event) => {
        if (event.target && scrollableAncestors.has(event.target)) {
          scheduleUpdate();
        }
      },
      { passive: true, capture: true },
    );

    const resizeCleanup = on(window, 'resize', scheduleUpdate, {
      passive: true,
    });

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      resizeObserver.disconnect();
      scrollCleanup();
      resizeCleanup();
    };
  }
</script>

{#if shouldShowPortal}
  <div
    bind:this={portalElement}
    use:portal={target}
    {@attach setupPositioning}
    class="pointer-events-auto fixed left-0 top-0"
    style:transform="translate({positionX}px, {positionY}px)"
    style:will-change="transform"
  >
    <div
      class={merge(className)}
      transition:scale={{ duration: 100, start: 0.95, opacity: 0 }}
    >
      {@render children()}
    </div>
  </div>
{/if}
