<script lang="ts">
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
    hideWhenInvisible = true,
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
    open && anchorElement && (!hideWhenInvisible || isVisible),
  );

  const styles = $derived(
    merge(
      [
        'transition-[opacity,transform]',
        'duration-100',
        'ease-out',
        open ? 'visible scale-100 opacity-100' : 'invisible scale-95 opacity-0',
      ],
      className,
    ),
  );

  $effect(() => {
    if (typeof anchor === 'string') {
      anchorElement = document.getElementById(anchor) as HTMLElement | null;
    } else {
      anchorElement = anchor;
    }
  });

  $effect(() => {
    if (typeof scrollContainer === 'string') {
      const element = document.getElementById(
        scrollContainer,
      ) as HTMLElement | null;
      scrollContainerElement = element || window;
    } else {
      scrollContainerElement = scrollContainer;
    }
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

  $effect(() => {
    if (!anchorElement || !hideWhenInvisible) {
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

  $effect(() => {
    if (!shouldShowPortal || !portalElement || !anchorElement) return;

    updatePosition();

    const resizeObserver = new ResizeObserver(() => {
      scheduleUpdate();
    });

    resizeObserver.observe(portalElement);
    resizeObserver.observe(anchorElement);
    if (scrollContainerElement !== window) {
      resizeObserver.observe(scrollContainerElement as HTMLElement);
    }

    window.addEventListener('resize', scheduleUpdate, { passive: true });

    if (scrollContainerElement === window) {
      window.addEventListener('scroll', scheduleUpdate, { passive: true });
    } else {
      scrollContainerElement.addEventListener('scroll', scheduleUpdate, {
        passive: true,
      });
    }

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleUpdate);
      if (scrollContainerElement === window) {
        window.removeEventListener('scroll', scheduleUpdate);
      } else {
        scrollContainerElement.removeEventListener('scroll', scheduleUpdate);
      }
    };
  });
</script>

{#if shouldShowPortal}
  <div
    bind:this={portalElement}
    use:portal={target}
    class="pointer-events-auto fixed left-0 top-0"
    style:transform="translate({positionX}px, {positionY}px)"
    style:will-change="transform"
  >
    <div class={styles}>
      {@render children()}
    </div>
  </div>
{/if}
