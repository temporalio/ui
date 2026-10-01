<script module lang="ts">
  import { cva } from 'class-variance-authority';

  import { WORKFLOW_ACTION_HOVER_CLASSES } from '../colors';

  // Module scope so the variant config is built once, not per mounted row.
  const groupHover = cva(['h-full w-full border-2'], {
    variants: {
      category: {
        ...WORKFLOW_ACTION_HOVER_CLASSES,
        update: 'border-blue-11 bg-indigo-11/80',
        other: 'border-neutral-5 bg-indigo-12/80',
        default: 'border-slate-blue-10 bg-slate-blue-11/80',
      },
    },
  });
</script>

<script lang="ts">
  import PayloadSummary from '$lib/components/payload/payload-summary.svelte';
  import Preview from '$lib/holocene/markdown-editor/preview.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { getEventGroupDisplayName } from '$lib/models/event-groups/get-group-name';
  import type { LazyGroup } from '$lib/services/grouped-event-buffer';
  import { setActiveGroup } from '$lib/stores/active-events';
  import { resolveSystemNexusEvent } from '$lib/system-nexus-endpoints';
  import type { WorkflowStatus } from '$lib/types/workflows';
  import {
    decodeLocalActivity,
    getLocalActivityMarkerEvent,
  } from '$lib/utilities/decode-local-activity';
  import { type ValidTime, validTimeToDate } from '$lib/utilities/format-time';
  import { getEventClassificationLabel } from '$lib/utilities/get-event-classification-label';
  import type { SummaryAttribute } from '$lib/utilities/get-single-attribute-for-event';
  import { getWorkflowStatusLabel } from '$lib/utilities/get-workflow-status-label';
  import {
    isActivityTaskScheduledEvent,
    isActivityTaskStartedEvent,
  } from '$lib/utilities/is-event-type';

  import { alignedDotBox, lineBox } from './primitives';
  import { type DotColors, dotColors, strokeColor } from '../colors';
  import { CategoryIcon, type TimelineIconName } from '../constants';
  import { DOT_STROKE, GUTTER, RADIUS, ROW_HEIGHT } from './constants';
  import { timelineTextPosition } from './timeline-positioning';
  import {
    getTimelineDotAlignment,
    getTimelineDotRole,
    getTimelineRowGeometry,
    isTimelineGroupLivePending,
    isTimelineLabelVisible,
    mergeTimelineRowConnectors,
  } from './timeline-row-geometry';

  type Props = {
    group: EventGroup | LazyGroup;
    canvasWidth: number;
    project: (time: ValidTime | undefined | null) => number;
    readOnly: boolean;
    // Reactive event count so the row recomputes on streamed appends (eventList
    // is mutated in place) and on pooled re-point.
    eventCount?: number;
    timelineKey?: string;
    active?: boolean;
    resolvedStatus?: WorkflowStatus;
    retainedEndTimeMs?: number;
    pendingEndTimeMs?: number;
    labelLeadingOffsetPx?: number;
    labelTrailingOffsetPx?: number;
    viewportEndOverscanPx?: number;
    continuousConnector?: boolean;
    connectorColor?: string;
    displayNamePrefix?: string;
    /** Replaces the composed label outright. */
    displayNameOverride?: string;
    showLabel?: boolean;
    /** Renders the label as secondary text rather than in the primary colour. */
    subtleLabel?: boolean;
    onBeforeSelect?: () => void;
    /** Row height of the view this row sits in. */
    rowHeight?: number;
  };

  let {
    group,
    canvasWidth,
    project,
    readOnly = false,
    eventCount = 0,
    timelineKey = group.id,
    active = true,
    resolvedStatus,
    retainedEndTimeMs,
    pendingEndTimeMs,
    labelLeadingOffsetPx = 0,
    labelTrailingOffsetPx = 0,
    viewportEndOverscanPx = 0,
    continuousConnector = false,
    connectorColor,
    displayNamePrefix,
    displayNameOverride,
    showLabel = true,
    subtleLabel = false,
    onBeforeSelect,
    rowHeight = ROW_HEIGHT,
  }: Props = $props();

  const timelineWidth = $derived(canvasWidth - 2 * GUTTER);
  const resolvedTerminal = $derived(
    Boolean(resolvedStatus) &&
      resolvedStatus !== 'Running' &&
      resolvedStatus !== 'Paused',
  );
  const isLivePending = $derived(
    isTimelineGroupLivePending({
      active,
      groupPending: group.isPending,
      resolvedTerminal,
      initialEvent: group.initialEvent,
      lastEvent: group.lastEvent,
    }),
  );
  const pendingActivity = $derived(active ? group?.pendingActivity : undefined);
  const materializedGroup = $derived('eventList' in group ? group : undefined);
  const compiledDisplayName = $derived(
    'timelineDisplayName' in group ? group.timelineDisplayName : undefined,
  );
  const compiledTimelineCategory = $derived(
    'timelineCategory' in group ? group.timelineCategory : undefined,
  );
  const lazyEventPoints = $derived(
    'eventPoints' in group ? group.eventPoints : undefined,
  );
  const lazyActivityAttempt = $derived(
    'activityAttempt' in group ? group.activityAttempt : undefined,
  );
  const baseDisplayName = $derived(
    compiledDisplayName ??
      materializedGroup?.displayName ??
      getEventGroupDisplayName(group.initialEvent as never),
  );
  const displayName = $derived(
    displayNameOverride ??
      (displayNamePrefix
        ? `${displayNamePrefix} · ${baseDisplayName}`
        : baseDisplayName),
  );

  // Reactive (not untrack) so a re-pointed pooled row relabels for its new group.
  const accessibleName = $derived(
    translate('events.row-accessible-name', {
      eventType: displayName,
      classification: resolvedStatus
        ? getWorkflowStatusLabel(resolvedStatus)
        : getEventClassificationLabel(
            group.finalClassification ?? group.classification,
          ),
    }),
  );
  const pauseTime = $derived(
    pendingActivity && pendingActivity.pauseInfo?.pauseTime,
  );
  const HALO = RADIUS * 1.5;

  let decodedLocalActivity: SummaryAttribute | undefined =
    $state.raw(undefined);
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

  // Keyed on group (not onMount) so it re-runs on pooled re-point; reuses a
  // value already decoded onto the group, otherwise decodes once.
  $effect(() => {
    const currentGroup = group;
    decodedLocalActivity =
      'decodedLocalActivity' in currentGroup
        ? currentGroup.decodedLocalActivity
        : undefined;
    if (currentGroup.category !== 'local-activity') return;
    if (!('eventList' in currentGroup)) return;
    if (currentGroup.decodedLocalActivity) return;

    const localActivityEvent = getLocalActivityMarkerEvent(currentGroup);
    if (!localActivityEvent) return;

    let cancelled = false;
    decodeLocalActivity(localActivityEvent)
      .then((decoded) => {
        if (cancelled || !decoded) return;
        currentGroup.decodedLocalActivity = decoded;
        decodedLocalActivity = decoded;
      })
      .catch((error) => {
        console.warn('Failed to decode local activity:', error);
      });
    return () => {
      cancelled = true;
    };
  });

  const getDistancePointsAndPositions = (
    timelineWidth: number,
    eventTimesMs: readonly number[],
    count: number,
    retainedEndTimeMs: number | undefined,
  ) => {
    // Loop to `count` (not events.map) to depend on eventCount without allocating.
    const points: number[] = [];
    const pointCount = Math.min(count, eventTimesMs.length);
    for (let idx = 0; idx < pointCount; idx++) {
      points.push(
        Math.round(project(new Date(eventTimesMs[idx]).toISOString())),
      );
    }
    if (pauseTime) {
      points.push(Math.round(project(pauseTime)));
    }
    if (!active && group.isPending && retainedEndTimeMs !== undefined) {
      const retainedEndX = Math.round(project(retainedEndTimeMs));
      if (retainedEndX > (points.at(-1) ?? -Infinity)) {
        points.push(retainedEndX);
      }
    }
    const { textAnchor, textPosition } = timelineTextPosition(
      points,
      rowHeight / 2,
      timelineWidth,
      isLivePending,
    );
    return { points, textAnchor, textPosition };
  };

  const { points, textAnchor, textPosition } = $derived(
    getDistancePointsAndPositions(
      timelineWidth,
      lazyEventPoints?.map((point) => point.timeMs) ??
        materializedGroup?.eventList.map((event) =>
          event.eventTime ? validTimeToDate(event.eventTime).getTime() : 0,
        ) ??
        [],
      eventCount,
      retainedEndTimeMs,
    ),
  );
  const rowGeometry = $derived(
    getTimelineRowGeometry({
      points,
      viewportStartPx: GUTTER,
      viewportEndPx: canvasWidth - GUTTER + viewportEndOverscanPx,
      pendingEndPx:
        isLivePending && pendingEndTimeMs !== undefined
          ? Math.round(project(new Date(pendingEndTimeMs).toISOString()))
          : undefined,
      isPending: isLivePending,
      hasPauseTime: Boolean(pauseTime),
      haloPx: HALO,
    }),
  );
  const visibleConnectors = $derived(
    continuousConnector
      ? mergeTimelineRowConnectors(rowGeometry.connectors)
      : rowGeometry.connectors,
  );
  const terminalMarkerIndex = $derived(
    resolvedTerminal || pauseTime
      ? points.length - 1
      : Math.min(group.eventCount - 1, points.length - 1),
  );
  const boundarySpanPx = $derived(
    terminalMarkerIndex > 0
      ? points[terminalMarkerIndex] - points[0]
      : undefined,
  );
  const hasVisiblePendingConnector = $derived(
    visibleConnectors.some((connector) => connector.pending),
  );
  const hasVisibleConnector = $derived(visibleConnectors.length > 0);
  const labelSafeInset = GUTTER + 1.5 * RADIUS;
  const labelTextPositionX = $derived(
    textPosition[0] +
      (textAnchor === 'start' ? labelLeadingOffsetPx : -labelTrailingOffsetPx),
  );
  const shouldClampLabel = $derived(
    hasVisibleConnector &&
      (hasVisiblePendingConnector ||
        labelTextPositionX - (textAnchor === 'end' ? labelWidth : 0) <
          labelSafeInset ||
        labelTextPositionX + (textAnchor === 'end' ? 0 : labelWidth) >
          canvasWidth - labelSafeInset),
  );
  const labelVisible = $derived(
    showLabel &&
      isTimelineLabelVisible(
        labelTextPositionX,
        GUTTER,
        canvasWidth - GUTTER,
        hasVisibleConnector,
      ),
  );

  const onClick = () => {
    if (readOnly) return;
    onBeforeSelect?.();
    setActiveGroup(group, timelineKey);
  };

  // Only activity groups carry an ActivityTaskStarted event; guard so other
  // categories don't scan their whole eventList every re-point for nothing.
  const activityTaskScheduled = $derived(
    group.category === 'activity'
      ? materializedGroup?.eventList.find(isActivityTaskStartedEvent)
      : undefined,
  );
  const retryAttempt = $derived(
    lazyActivityAttempt ?? activityTaskScheduled?.attributes?.attempt ?? 0,
  );
  const retried = $derived(retryAttempt > 1);

  const effectiveCategory = $derived(
    compiledTimelineCategory ??
      resolveSystemNexusEvent(group.initialEvent)?.timelineCategory ??
      group.category,
  );

  const lineColor = $derived(
    connectorColor ??
      strokeColor({
        category: effectiveCategory,
        classification: group.lastEvent.classification,
      }),
  );
  const showRetryGradient = $derived(
    retried && group.lastEvent.classification === 'Completed',
  );
  const scheduling = $derived(group.lastEvent.classification === 'Completed');

  const pendingLineColor = $derived(
    connectorColor ??
      strokeColor({
        category: pendingActivity
          ? (pendingActivity.attempt ?? 0) > 1
            ? 'retry'
            : 'pending'
          : effectiveCategory,
        classification: group.lastEvent.classification,
      }),
  );

  // The button spans just the dots + connectors; its coords are button-local
  // (offset by spanLeft). Hover/focus highlight is CSS-only (no JS state).
  // Highlight corner radius, concentric with the dots' rounded corners.
  const highlightRadius = RADIUS * 0.8;
  const spanCy = HALO; // button-local vertical center
</script>

{#snippet summary(value: string)}
  {#if materializedGroup?.userMetadata?.summary}
    <Preview
      content={value}
      fill={false}
      fitContent
      compact
      singleLine
      minHeight={0}
      overrideTheme="primary"
      title={translate('workflows.summary')}
    />
  {:else}
    {value}
  {/if}
{/snippet}

<!-- lines/dots are inline snippets, not child components — plain divs, no
     per-element instances. -->
{#snippet connector(
  leftX: number,
  rightX: number,
  color: string,
  opts: {
    dashed?: boolean;
    animate?: boolean;
    gradient?: boolean;
    dim?: number;
    liveEdge?: boolean;
    viewportClippedStart?: boolean;
  },
)}
  {@const bounds = lineBox([leftX, spanCy], [rightX, spanCy])}
  <!-- Live paint keeps one extra viewport available for compositor motion
       between coarse clock commits. The clip still exposes only elapsed time. -->
  <div
    class="tl-line absolute z-0"
    class:tl-line--gradient={opts.gradient}
    class:tl-line--dashed={opts.dashed}
    class:tl-line--animate={opts.animate}
    class:tl-line--live={opts.liveEdge}
    class:tl-line--viewport-clipped-start={opts.viewportClippedStart}
    style:left="{bounds.left}px"
    style:top="{bounds.top}px"
    style:width="{opts.liveEdge ? canvasWidth * 2 : bounds.width}px"
    style:height="{bounds.height}px"
    style:--tl-line-color={color}
    style:--tl-live-committed-width="{bounds.width}px"
    style:opacity={opts.dim || null}
  ></div>
{/snippet}

{#snippet dot(
  pointX: number,
  colors: DotColors,
  icon: TimelineIconName | undefined,
  alignment: 'start' | 'center' | 'end',
)}
  {@const bounds = alignedDotBox(pointX, spanCy, alignment)}
  <!-- transform (not left/top) so streaming/live reprojection composites the dot
       instead of triggering layout; anchored at 0,0 by left-0 top-0. -->
  <div
    data-dot-alignment={alignment}
    class="absolute left-0 top-0 z-10 h-[var(--dot)] w-[var(--dot)] rounded-[var(--dot-r)] border-2 border-solid"
    style:transform="translate({bounds.left}px, {bounds.top}px)"
    style:border-color={colors.stroke}
    style:background={colors.fill}
  >
    {#if icon}
      <svg
        class="absolute left-1/2 top-1/2 h-[var(--dot-icon)] w-[var(--dot-icon)] -translate-x-1/2 -translate-y-1/2 text-black"
        viewBox="0 0 16 16"
      >
        <use href="#ti-{icon}" />
      </svg>
    {/if}
  </div>
{/snippet}

{#snippet label(decodedValue: string, spanLeft: number)}
  {@const iconName =
    (pendingActivity && !pendingActivity.paused) || retried
      ? 'retry'
      : undefined}
  {@const clampedLabelMaxWidth = Math.max(
    0,
    canvasWidth - 2 * (GUTTER + 1.5 * RADIUS),
  )}
  {@const clampedLabelLeft = `clamp(calc(${GUTTER + 1.5 * RADIUS - spanLeft}px + var(--timeline-frame-offset, 0px)), ${labelTextPositionX - spanLeft - (textAnchor === 'end' ? labelWidth : 0)}px, calc(${canvasWidth - GUTTER - 1.5 * RADIUS - labelWidth - spanLeft}px + var(--timeline-frame-offset, 0px)))`}
  <div
    class="pointer-events-auto absolute z-10 flex select-none items-center gap-1 whitespace-nowrap rounded-full bg-surface-primary px-1.5 text-xs leading-none {textAnchor ===
    'end'
      ? `${shouldClampLabel ? '' : '-translate-x-full'} -translate-y-1/2 flex-row-reverse`
      : '-translate-y-1/2'}"
    class:timeline-running-label={hasVisiblePendingConnector}
    class:timeline-clamped-label={shouldClampLabel}
    class:overflow-hidden={shouldClampLabel}
    style:left={shouldClampLabel
      ? clampedLabelLeft
      : `${labelTextPositionX - spanLeft}px`}
    style:top="{spanCy}px"
    style:max-width={shouldClampLabel ? `${clampedLabelMaxWidth}px` : undefined}
    use:measureLabel
  >
    {#if iconName}
      <svg
        class="h-[var(--dot)] w-[var(--dot)] shrink-0 rounded-full p-[3px] text-current"
        viewBox="0 0 16 16"
      >
        <use href="#ti-{iconName}" />
      </svg>
    {/if}
    <span
      class="inline-flex min-h-[var(--dot)] min-w-0 items-center overflow-hidden text-ellipsis rounded-full {subtleLabel
        ? 'text-secondary'
        : 'text-current'}"
    >
      {#if pendingActivity}
        {translate('workflows.attempt')}
        {pendingActivity.attempt} / {pendingActivity.maximumAttempts || '∞'}
        •&nbsp;{@render summary(decodedValue)}
      {:else if retried}
        {retryAttempt} •&nbsp; {@render summary(decodedValue)}
      {:else if decodedLocalActivity}
        {decodedLocalActivity.value}
      {:else}
        {@render summary(decodedValue)}
      {/if}
    </span>
  </div>
{/snippet}

<div class="absolute inset-0">
  {#if rowGeometry.hitRange}
    {@const spanLeft = rowGeometry.hitRange.startPx}
    {@const spanWidth = Math.max(
      1,
      rowGeometry.hitRange.endPx - rowGeometry.hitRange.startPx,
    )}
    <button
      type="button"
      class="event"
      aria-label={accessibleName}
      disabled={readOnly}
      style:left="{spanLeft}px"
      style:top="{rowHeight / 2 - HALO}px"
      style:width="{spanWidth}px"
      style:height="{RADIUS * 3}px"
      onclick={onClick}
    >
      <div
        class="highlight {groupHover({ category: effectiveCategory })}"
        style:border-radius="{highlightRadius}px"
        style:left={continuousConnector ? `${HALO}px` : undefined}
        style:width={continuousConnector
          ? `calc(100% - ${2 * HALO}px)`
          : undefined}
      ></div>
      {#each visibleConnectors as visibleConnector (visibleConnector.index)}
        {@render connector(
          visibleConnector.startPx - spanLeft,
          visibleConnector.endPx - spanLeft,
          visibleConnector.pending ? pendingLineColor : lineColor,
          {
            gradient: !visibleConnector.pending && showRetryGradient,
            dim:
              !visibleConnector.pending &&
              scheduling &&
              visibleConnector.index === 0
                ? 0.35
                : undefined,
            dashed: visibleConnector.pending,
            animate: visibleConnector.pending,
            liveEdge: visibleConnector.pending,
            viewportClippedStart: visibleConnector.startPx <= GUTTER,
          },
        )}
      {/each}
      {#each rowGeometry.dots as visibleDot (visibleDot.index)}
        {@const localX = visibleDot.xPx - spanLeft}
        {@const index = visibleDot.index}
        {@const alignment = getTimelineDotAlignment({
          index,
          eventCount: group.eventCount,
          pending: (group.isPending || isLivePending) && !resolvedTerminal,
          boundarySpanPx,
          markerSizePx: 2 * RADIUS + DOT_STROKE,
          boundaryEndIndex: terminalMarkerIndex,
          fanOutShortBoundaryMarkers: continuousConnector,
          startMarkerInsideConnector: continuousConnector,
          centerSingleMarker: effectiveCategory === 'signal',
        })}
        {@const role = getTimelineDotRole({
          index,
          eventCount: group.eventCount,
          pointCount: points.length,
          pending: group.isPending || isLivePending,
          livePending: isLivePending,
          hasPauseTime: Boolean(pauseTime),
          active,
          resolvedTerminal,
          showLivePendingMarker: !continuousConnector,
        })}
        {#if role}
          {@render dot(
            localX,
            dotColors(
              resolvedTerminal && index >= group.eventCount
                ? resolvedStatus
                : (lazyEventPoints?.[index]?.classification ??
                    materializedGroup?.eventList[index]?.classification),
            ),
            role === 'pending'
              ? 'retry'
              : role === 'pause'
                ? 'pause'
                : decodedLocalActivity
                  ? CategoryIcon['local-activity'].name
                  : CategoryIcon[effectiveCategory].name,
            alignment,
          )}
        {/if}
      {/each}
      <!-- Inside the button so hovering/clicking the label hits the same target;
         positioned button-local (offset by spanLeft), may overflow the box. -->
      {#if labelVisible}
        {#if materializedGroup?.userMetadata?.summary}
          <PayloadSummary
            value={materializedGroup.userMetadata.summary}
            prefix={isActivityTaskScheduledEvent(group.initialEvent)
              ? displayName
              : ''}
            fallback={decodedLocalActivity
              ? translate('events.category.local-activity')
              : displayName}
          >
            {#snippet children(decodedValue)}
              {@render label(decodedValue, spanLeft)}
            {/snippet}
          </PayloadSummary>
        {:else}
          {@render label(displayName, spanLeft)}
        {/if}
      {/if}
    </button>
  {/if}
</div>

<style lang="postcss">
  .event {
    position: absolute;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
    outline: none;

    /* .rows is pointer-events:none; opt back in so the dots/label are clickable. */
    pointer-events: auto;
  }

  .event:disabled {
    cursor: default;
  }

  .highlight {
    position: absolute;
    inset: 0;
    opacity: 0;
    pointer-events: none;
  }

  .event:not(:disabled):hover .highlight,
  .event:not(:disabled):focus-visible .highlight {
    opacity: 1;
  }
</style>
