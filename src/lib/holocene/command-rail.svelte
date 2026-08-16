<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { MediaQuery } from 'svelte/reactivity';

  import { onMount, type Snippet, tick } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import IconButton from '$lib/holocene/icon-button.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'children' | 'class'
  > {
    label: string;
    class?: string;
    viewportClass?: string;
    controlClass?: string;
    children: Snippet;
  }

  let {
    label,
    class: className = '',
    viewportClass = '',
    controlClass = 'surface-background',
    children,
    id,
    role,
    'aria-label': ariaLabel = label,
    'data-testid': testId,
    onscroll,
    onfocusin,
    ...rest
  }: Props = $props();

  const reducedMotion = new MediaQuery('(prefers-reduced-motion: reduce)');

  let viewport = $state<HTMLDivElement>();
  let hasOverflow = $state(false);
  let canScrollStart = $state(false);
  let canScrollEnd = $state(false);
  let measureFrame: number | undefined;
  let revealFrame: number | undefined;

  const measure = () => {
    if (!viewport) return;

    const styles = getComputedStyle(viewport);
    const inlinePadding =
      Number.parseFloat(styles.paddingLeft) +
      Number.parseFloat(styles.paddingRight);
    const contentWidth = viewport.scrollWidth - inlinePadding;
    const tolerance = 1;
    const nextHasOverflow = contentWidth > viewport.clientWidth + tolerance;

    if (hasOverflow !== nextHasOverflow) {
      hasOverflow = nextHasOverflow;
      void tick().then(scheduleMeasure);
    }

    if (!nextHasOverflow) {
      canScrollStart = false;
      canScrollEnd = false;
      return;
    }

    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);

    canScrollStart = viewport.scrollLeft > tolerance;
    canScrollEnd = viewport.scrollLeft < maxScroll - tolerance;
  };

  const scheduleMeasure = () => {
    if (measureFrame !== undefined) cancelAnimationFrame(measureFrame);

    measureFrame = requestAnimationFrame(() => {
      measureFrame = undefined;
      measure();
    });
  };

  const reveal = (element: HTMLElement) => {
    if (!viewport || !viewport.contains(element)) return;

    const viewportBounds = viewport.getBoundingClientRect();
    const elementBounds = element.getBoundingClientRect();
    // Keep focused content clear of the largest rail control. This matches
    // --target-size (44px) and includes room for its focus indicator.
    const controlInset = 48;
    const visibleStart =
      viewportBounds.left + (canScrollStart ? controlInset : 0);
    const visibleEnd = viewportBounds.right - (canScrollEnd ? controlInset : 0);

    if (elementBounds.left < visibleStart) {
      viewport.scrollBy({
        left: elementBounds.left - visibleStart,
        behavior: 'auto',
      });
    } else if (elementBounds.right > visibleEnd) {
      viewport.scrollBy({
        left: elementBounds.right - visibleEnd,
        behavior: 'auto',
      });
    }
  };

  const revealActiveItem = () => {
    if (revealFrame !== undefined) cancelAnimationFrame(revealFrame);

    revealFrame = requestAnimationFrame(() => {
      revealFrame = undefined;
      const activeItem = viewport?.querySelector<HTMLElement>(
        '[aria-selected="true"], [aria-pressed="true"], [aria-current="page"]',
      );

      if (activeItem) reveal(activeItem);
    });
  };

  const handleScroll = (
    event: UIEvent & { currentTarget: EventTarget & HTMLDivElement },
  ) => {
    scheduleMeasure();
    onscroll?.(event);
  };

  const handleFocusIn = (
    event: FocusEvent & { currentTarget: EventTarget & HTMLDivElement },
  ) => {
    if (event.target instanceof HTMLElement) reveal(event.target);
    onfocusin?.(event);
  };

  const scroll = (direction: -1 | 1) => {
    if (!viewport) return;

    viewport.scrollBy({
      left: direction * Math.max(128, viewport.clientWidth * 0.7),
      behavior: reducedMotion.current ? 'auto' : 'smooth',
    });
  };

  onMount(() => {
    let disposed = false;

    const resizeObserver = new ResizeObserver(() => {
      scheduleMeasure();
      revealActiveItem();
    });
    const observeChildren = () => {
      if (!viewport) return;
      resizeObserver.observe(viewport);
      for (const child of viewport.children) resizeObserver.observe(child);
    };
    const mutationObserver = new MutationObserver((records) => {
      observeChildren();
      scheduleMeasure();

      if (
        records.some(
          ({ type, attributeName }) =>
            type === 'childList' ||
            attributeName === 'aria-selected' ||
            attributeName === 'aria-pressed' ||
            attributeName === 'aria-current',
        )
      ) {
        revealActiveItem();
      }
    });

    const initialize = async () => {
      await tick();
      if (disposed || !viewport) return;

      observeChildren();
      mutationObserver.observe(viewport, {
        attributeFilter: ['aria-current', 'aria-pressed', 'aria-selected'],
        attributes: true,
        childList: true,
        subtree: true,
      });
      measure();
      revealActiveItem();

      void document.fonts?.ready.then(() => {
        if (!disposed) scheduleMeasure();
      });
    };

    void initialize();

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      if (measureFrame !== undefined) cancelAnimationFrame(measureFrame);
      if (revealFrame !== undefined) cancelAnimationFrame(revealFrame);
    };
  });
</script>

<div
  class={merge('command-rail relative min-w-0', className)}
  data-overflow={hasOverflow}
  data-overflow-start={canScrollStart}
  data-overflow-end={canScrollEnd}
  data-testid={testId}
>
  <div
    bind:this={viewport}
    {id}
    {role}
    aria-label={ariaLabel}
    data-testid={testId ? `${testId}-viewport` : undefined}
    class={merge(
      'command-rail-viewport min-w-0 overflow-x-auto overflow-y-hidden [scrollbar-width:none]',
      viewportClass,
    )}
    {...rest}
    onscroll={handleScroll}
    onfocusin={handleFocusIn}
  >
    {@render children()}
  </div>

  {#if hasOverflow}
    <div
      class="command-rail-edge command-rail-edge-start"
      aria-hidden="true"
    ></div>
    <IconButton
      icon="chevron-left"
      label={translate('common.scroll-backward', { label })}
      size="xs"
      class={merge(
        'command-rail-control command-rail-control-start border-subtle',
        controlClass,
        !canScrollStart &&
          'pointer-events-none opacity-0 focus-visible:opacity-100',
      )}
      data-testid={testId ? `${testId}-previous` : undefined}
      aria-controls={id}
      aria-disabled={!canScrollStart}
      tabindex={canScrollStart ? 0 : -1}
      onclick={() => canScrollStart && scroll(-1)}
    />
    <div
      class="command-rail-edge command-rail-edge-end"
      aria-hidden="true"
    ></div>
    <IconButton
      icon="chevron-right"
      label={translate('common.scroll-forward', { label })}
      size="xs"
      class={merge(
        'command-rail-control command-rail-control-end border-subtle',
        controlClass,
        !canScrollEnd &&
          'pointer-events-none opacity-0 focus-visible:opacity-100',
      )}
      data-testid={testId ? `${testId}-next` : undefined}
      aria-controls={id}
      aria-disabled={!canScrollEnd}
      tabindex={canScrollEnd ? 0 : -1}
      onclick={() => canScrollEnd && scroll(1)}
    />
  {/if}
</div>

<style lang="postcss">
  /* stylelint-disable property-no-vendor-prefix -- Safari still requires the prefixed mask property. */
  .command-rail-viewport {
    scroll-padding-inline: var(--target-size);
  }

  .command-rail-viewport::-webkit-scrollbar {
    display: none;
  }

  .command-rail-viewport :global(:focus-visible) {
    --tw-ring-inset: inset;
    --tw-ring-offset-width: 0px;

    outline-offset: -2px;
  }

  .command-rail[data-overflow-start='true'][data-overflow-end='false']
    .command-rail-viewport {
    -webkit-mask-image: linear-gradient(
      to right,
      transparent,
      black var(--target-size)
    );
    mask-image: linear-gradient(
      to right,
      transparent,
      black var(--target-size)
    );
  }

  .command-rail[data-overflow-start='false'][data-overflow-end='true']
    .command-rail-viewport {
    -webkit-mask-image: linear-gradient(
      to left,
      transparent,
      black var(--target-size)
    );
    mask-image: linear-gradient(to left, transparent, black var(--target-size));
  }

  .command-rail[data-overflow-start='true'][data-overflow-end='true']
    .command-rail-viewport {
    -webkit-mask-image: linear-gradient(
      to right,
      transparent,
      black var(--target-size),
      black calc(100% - var(--target-size)),
      transparent
    );
    mask-image: linear-gradient(
      to right,
      transparent,
      black var(--target-size),
      black calc(100% - var(--target-size)),
      transparent
    );
  }

  .command-rail-edge {
    @apply pointer-events-none absolute inset-y-0 z-10 w-10;
  }

  .command-rail-edge-start {
    inset-inline-start: 0;
  }

  .command-rail-edge-end {
    inset-inline-end: 0;
  }

  :global(.command-rail-control) {
    @apply absolute top-1/2 z-20 -translate-y-1/2;
  }

  :global(.command-rail-control-start) {
    inset-inline-start: 0;
  }

  :global(.command-rail-control-end) {
    inset-inline-end: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .command-rail-viewport {
      scroll-behavior: auto;
    }
  }

  @media (forced-colors: active) {
    .command-rail-viewport {
      -webkit-mask-image: none !important;
      mask-image: none !important;
    }

    :global(.command-rail-control) {
      border: 1px solid ButtonText;
      background: Canvas;
      color: ButtonText;
    }
  }
  /* stylelint-enable property-no-vendor-prefix */
</style>
