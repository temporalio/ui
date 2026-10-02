<script lang="ts">
  import { translate } from '$lib/i18n/translate';

  import type { DotColors } from '../colors';
  import { DOT_STROKE, GUTTER, RADIUS } from './constants';
  import { alignedDotBox } from './primitives';
  import type { TimelineFrameGrowthMotion } from './timeline-row-entry-motion';
  import type { WorkflowFrameGeometry } from './workflow-frame-geometry';

  interface Props {
    geometry: WorkflowFrameGeometry;
    label: string;
    workflowType?: string;
    accessibleName: string;
    color: string;
    colors: DotColors;
    live: boolean;
    kind: 'chain' | 'run';
    headerKind?: 'synthetic' | 'relationship';
    depth?: number;
    paint: 'background' | 'foreground';
    /** Renders the label as secondary text rather than in the frame's colour. */
    subtleLabel?: boolean;
    bandTop: number;
    bandHeight: number;
    entryOffsetPx?: number;
    entryOffsetXPx?: number;
    entryKey?: string;
    bottomEntryOffsetPx?: number;
    growthMotion?: TimelineFrameGrowthMotion;
    /** Draws the workflow icon in the frame's dots; off beside the tree. */
    showIcons?: boolean;
  }

  let {
    geometry,
    label,
    workflowType,
    accessibleName,
    color,
    colors,
    live,
    kind,
    headerKind = 'synthetic',
    depth = 0,
    paint,
    subtleLabel = false,
    bandTop,
    bandHeight,
    entryOffsetPx = 0,
    entryOffsetXPx = 0,
    entryKey,
    bottomEntryOffsetPx = 0,
    growthMotion = undefined,
    showIcons = true,
  }: Props = $props();

  const frameBottomEntryOffsetPx = $derived(
    growthMotion?.bottomOffsetPx ?? bottomEntryOffsetPx,
  );
  const frameGrowthClipPath = $derived(
    growthMotion ? `inset(0 0 ${growthMotion.clipInsetPx}px 0)` : undefined,
  );

  const bandBottom = $derived(bandTop + bandHeight);
  const paintTop = $derived(Math.max(geometry.topPx, bandTop));
  const paintBottom = $derived(Math.min(geometry.bottomPx, bandBottom));
  const paintHeight = $derived(Math.max(0, paintBottom - paintTop));
  const drawTop = $derived(
    geometry.topPx >= bandTop && geometry.topPx <= bandBottom,
  );
  const drawBottom = $derived(
    geometry.bottomPx >= bandTop && geometry.bottomPx <= bandBottom,
  );
  const showLabel = $derived(
    geometry.horizontal !== null && (live || geometry.labelMaxWidthPx >= 48),
  );
  const horizontalWidth = $derived(
    geometry.horizontal
      ? Math.max(0, geometry.horizontal.endPx - geometry.horizontal.startPx)
      : 0,
  );
  const sidePaintHeight = $derived(
    paintHeight + (kind === 'chain' && drawBottom ? 2 : 0),
  );
  const visibleDots = $derived(
    [
      geometry.startDotPx === null
        ? null
        : { point: geometry.startDotPx, alignment: 'start' as const },
      geometry.endDotPx === null || geometry.endDotPx === geometry.startDotPx
        ? null
        : { point: geometry.endDotPx, alignment: 'end' as const },
    ].filter(
      (
        dot,
      ): dot is {
        point: number;
        alignment: 'start' | 'end';
      } => dot !== null,
    ),
  );
  let labelWidth = $state(0);
  const measureLabel = (element: HTMLElement) => {
    const observer = new ResizeObserver(([entry]) => {
      const width =
        entry.borderBoxSize[0]?.inlineSize ?? entry.contentRect.width;
      labelWidth = Math.round(width);
    });
    observer.observe(element);
    return { destroy: () => observer.disconnect() };
  };
  const labelSafeInset = GUTTER + 1.5 * RADIUS;
  const labelIconGap = $derived(kind === 'chain' ? 12 : 0);
  const labelAttachedLeft = $derived(geometry.labelStartPx + labelIconGap);
  const labelEndAttachedLeft = $derived(
    geometry.horizontal
      ? geometry.horizontal.endPx -
          labelWidth -
          2 * (RADIUS + DOT_STROKE / 2) -
          labelIconGap
      : labelAttachedLeft,
  );
  const labelPinnedLeft =
    'max(var(--workflow-label-attached-left), calc(var(--workflow-label-safe-inset) + var(--timeline-frame-offset, 0px)))';
  const labelLeft = $derived(
    geometry.drawStartSide
      ? labelPinnedLeft
      : `min(${labelPinnedLeft}, var(--workflow-label-end-attached-left))`,
  );
  const labelWidthAdjustment = $derived(
    kind === 'chain' ? 2 * labelIconGap + DOT_STROKE : 0,
  );
  const labelMaxWidth = $derived(
    live
      ? 'none'
      : `${Math.max(0, geometry.labelMaxWidthPx - labelWidthAdjustment)}px`,
  );
  const displayLabel = $derived(
    `${translate(kind === 'chain' ? 'common.workflow-id' : 'common.run-id')}: ${label}${kind === 'chain' && workflowType ? ` · ${workflowType}` : ''}`,
  );
  const drawHeader = $derived(
    drawTop && (kind === 'run' || headerKind === 'synthetic'),
  );
  const frameBackground = $derived(
    kind === 'run'
      ? 'transparent'
      : `color-mix(in srgb, ${color} 3%, transparent)`,
  );
</script>

<div
  class="pointer-events-none absolute inset-0"
  class:timeline-frame-entering={entryOffsetPx !== 0 || entryOffsetXPx !== 0}
  data-timeline-entry-offset={entryOffsetPx || undefined}
  data-timeline-entry-key={entryKey}
  data-timeline-entry-motion={entryOffsetPx !== 0 || entryOffsetXPx !== 0
    ? true
    : undefined}
  data-timeline-horizontal-entry={entryOffsetXPx !== 0 ? true : undefined}
  data-timeline-frame-entry
  data-timeline-frame-bottom-px={geometry.bottomPx}
  data-timeline-frame-growth-clip-inset={growthMotion?.clipInsetPx}
  data-timeline-bottom-entry-offset={frameBottomEntryOffsetPx || undefined}
  style:--timeline-row-entry-offset={`${entryOffsetPx}px`}
  style:--timeline-row-entry-x-offset={entryOffsetXPx
    ? `calc(${entryOffsetXPx}px + var(--timeline-frame-offset, 0px))`
    : '0px'}
  style:--workflow-header-radius={`${RADIUS}px`}
>
  {#if paint === 'foreground'}
    <div
      role="img"
      aria-label={accessibleName}
      data-frame-kind={kind}
      data-frame-identity
      class="pointer-events-none absolute inset-0"
    ></div>
  {/if}

  <!-- Live frame paint extends one viewport beyond the committed edge so the
       compositor reveal cannot exhaust its backing box at one-second scales. -->
  {#if geometry.horizontal && paintHeight > 0}
    <div
      aria-hidden="true"
      data-frame-kind={kind}
      data-frame-paint={paint}
      data-frame-depth={kind === 'chain' ? depth : undefined}
      class="pointer-events-none absolute inset-0"
    >
      {#if paint === 'background'}
        <div
          data-timeline-frame-growth-clip
          class:frame-live-reveal={live}
          class="pointer-events-none absolute rounded"
          style:left="{geometry.horizontal.startPx}px"
          style:top="{paintTop}px"
          style:right={live ? '-100%' : undefined}
          style:width={live ? undefined : `${horizontalWidth}px`}
          style:height="{paintHeight}px"
          style:background={frameBackground}
          style:--frame-committed-width="{horizontalWidth}px"
          style:clip-path={frameGrowthClipPath}
        ></div>
      {:else}
        {#if drawHeader}
          <div
            class:frame-edge-chain-header={kind === 'chain'}
            class:frame-dashed={live && kind === 'run'}
            class:tl-line--animate={live && kind === 'run'}
            class:tl-line--dashed={live && kind === 'run'}
            class:tl-line--live={live}
            class:tl-line--viewport-clipped-start={live &&
              !geometry.drawStartSide}
            class="frame-edge pointer-events-none absolute"
            style:left="{geometry.horizontal.startPx}px"
            style:top="{geometry.topPx}px"
            style:right={live ? '-100%' : undefined}
            style:width={live ? undefined : `${horizontalWidth}px`}
            style:--frame-color={color}
            style:--tl-line-color={color}
            style:--tl-live-committed-width="{horizontalWidth}px"
          ></div>
        {/if}
        {#if drawBottom}
          <div
            class:timeline-frame-boundary-entering={frameBottomEntryOffsetPx !==
              0}
            class:frame-edge-chain={kind === 'chain'}
            class:frame-dashed={live && kind === 'run'}
            class:tl-line--animate={live && kind === 'run'}
            class:tl-line--dashed={live && kind === 'run'}
            class:tl-line--live={live}
            class="frame-edge pointer-events-none absolute"
            data-timeline-frame-growth-boundary
            data-timeline-entry-offset={frameBottomEntryOffsetPx || undefined}
            data-timeline-entry-key={entryKey
              ? `${entryKey}:bottom`
              : undefined}
            style:left="{geometry.horizontal.startPx}px"
            style:top="{geometry.bottomPx}px"
            style:right={live
              ? '-100%'
              : `calc(100% - ${geometry.horizontal.endPx}px)`}
            style:--frame-color={color}
            style:--tl-line-color={color}
            style:--tl-live-committed-width="{horizontalWidth}px"
            style:--timeline-frame-boundary-offset={`${frameBottomEntryOffsetPx}px`}
          ></div>
        {/if}
        {#if geometry.drawStartSide}
          <div
            class:frame-side-chain={kind === 'chain'}
            class:frame-side-dashed={live && kind === 'run'}
            class="frame-side frame-side-start pointer-events-none absolute"
            data-timeline-frame-growth-clip
            style:left="{geometry.horizontal.startPx}px"
            style:top="{paintTop}px"
            style:height="{sidePaintHeight}px"
            style:--frame-color={color}
            style:clip-path={frameGrowthClipPath}
          ></div>
        {/if}
        {#if geometry.drawEndSide}
          <div
            class:frame-side-chain={kind === 'chain'}
            class:frame-side-dashed={live && kind === 'run'}
            class="frame-side frame-side-end pointer-events-none absolute"
            data-timeline-frame-growth-clip
            style:left="{geometry.horizontal.endPx}px"
            style:top="{paintTop}px"
            style:height="{sidePaintHeight}px"
            style:--frame-color={color}
            style:clip-path={frameGrowthClipPath}
          ></div>
        {/if}
        {#if showLabel && drawHeader}
          <span
            class:frame-label-chain={kind === 'chain'}
            class:workflow-run-label={kind === 'run'}
            class="pointer-events-none absolute z-10 inline-flex min-h-[var(--dot)] items-center truncate whitespace-nowrap rounded-full bg-surface-primary px-1.5 text-xs leading-none {subtleLabel
              ? 'text-secondary'
              : 'text-current'}"
            style:left={labelLeft}
            style:top="{geometry.topPx - RADIUS}px"
            style:max-width={labelMaxWidth}
            style:visibility={labelWidth > 0 ? 'visible' : 'hidden'}
            style:--workflow-label-attached-left="{labelAttachedLeft}px"
            style:--workflow-label-safe-inset="{labelSafeInset}px"
            style:--workflow-label-end-attached-left="{labelEndAttachedLeft}px"
            style:--frame-color={color}
            title={displayLabel}
            use:measureLabel
          >
            <span class="truncate">{displayLabel}</span>
          </span>
        {/if}
        {#if drawHeader && kind === 'chain'}
          {#each visibleDots as dot (dot.point)}
            {@const bounds = alignedDotBox(
              dot.point,
              geometry.topPx,
              dot.alignment,
            )}
            <div
              class="pointer-events-none absolute h-[var(--dot)] w-[var(--dot)] rounded-[var(--dot-r)] border-2 border-solid"
              style:left="{bounds.left}px"
              style:top="{bounds.top}px"
              style:border-color={colors.stroke}
              style:background={colors.fill}
            >
              {#if showIcons}
                <svg
                  aria-hidden="true"
                  class="absolute left-1/2 top-1/2 h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2 text-black"
                  viewBox="0 0 24 24"><use href="#ti-workflow" /></svg
                >
              {/if}
            </div>
          {/each}
        {/if}
      {/if}
    </div>
  {/if}
</div>

<style lang="postcss">
  .timeline-frame-entering {
    translate: var(--timeline-row-entry-x-offset)
      var(--timeline-row-entry-offset);
  }

  .timeline-frame-boundary-entering {
    translate: 0 var(--timeline-frame-boundary-offset);
  }

  @media (prefers-reduced-motion: reduce) {
    .timeline-frame-entering {
      translate: none;
    }

    .timeline-frame-boundary-entering {
      translate: none;
    }
  }

  .frame-edge {
    height: 2px;
    background: var(--frame-color);
    transform: translateY(-1px);
  }

  .frame-side {
    width: 2px;
    background: var(--frame-color);
  }

  .frame-side-start {
    transform: none;
  }

  .frame-side-end {
    transform: translateX(-100%);
  }

  .frame-edge-chain {
    height: 4px;
    background: var(--frame-color);
    transform: translateY(-2px);
  }

  .frame-edge-chain-header {
    height: calc(2 * var(--workflow-header-radius));
    background: var(--frame-color);
    transform: translateY(calc(-1 * var(--workflow-header-radius)));
  }

  .frame-side-chain {
    width: 4px;
    background: var(--frame-color);
  }

  .frame-label-chain {
    font-weight: 400;
  }

  .frame-dashed {
    background: repeating-linear-gradient(
      to right,
      var(--frame-color) 0 4px,
      transparent 4px 8px
    );
  }

  .frame-side-dashed {
    background: repeating-linear-gradient(
      to bottom,
      var(--frame-color) 0 4px,
      transparent 4px 8px
    );
  }

  .frame-live-reveal {
    clip-path: inset(
      0
        calc(
          100% - var(--frame-committed-width) -
            var(--timeline-live-edge-extension, 0px)
        )
        0 0
    );
    will-change: clip-path;
  }
</style>
