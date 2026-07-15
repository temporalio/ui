<script module lang="ts">
  import { cva } from 'class-variance-authority';

  // Module scope so the variant config is built once, not per mounted row.
  const groupHover = cva(['h-full w-full border-2'], {
    variants: {
      category: {
        workflow: 'border-blue-700 bg-blue-800/80 ',
        activity: 'border-purple-700 bg-purple-800/80 ',
        'child-workflow': 'border-cyan-600  bg-cyan-600/80 ',
        timer: 'border-yellow-700 bg-yellow-800/80',
        signal: 'border-pink-700 bg-pink-800/80',
        update: 'border-blue-700 bg-blue-800/80',
        other: 'border-slate-700 bg-slate-800/80',
        nexus: 'border-indigo-700 bg-indigo-800/80',
        'local-activity': 'border-slate-700 bg-slate-800/80',
        default: 'border-purple-700 bg-purple-900/80',
      },
    },
  });
</script>

<script lang="ts">
  import PayloadSummary from '$lib/components/payload/payload-summary.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { setActiveGroup } from '$lib/stores/active-events';
  import {
    decodeLocalActivity,
    getLocalActivityMarkerEvent,
  } from '$lib/utilities/decode-local-activity';
  import type { ValidTime } from '$lib/utilities/format-time';
  import type { SummaryAttribute } from '$lib/utilities/get-single-attribute-for-event';
  import { getEventClassificationLabel } from '$lib/utilities/get-status-label';
  import {
    isActivityTaskScheduledEvent,
    isActivityTaskStartedEvent,
  } from '$lib/utilities/is-event-type';

  import { dotBox, lineBox } from './primitives';
  import { type DotColors, dotColors, strokeColor } from '../colors';
  import { CategoryIcon, type TimelineIconName } from '../constants';
  import { GUTTER, RADIUS, ROW_HEIGHT } from './constants';
  import { timelineTextPosition } from './timeline-positioning';

  type Props = {
    group: EventGroup;
    canvasWidth: number;
    project: (time: ValidTime | undefined | null) => number;
    readOnly: boolean;
    // Reactive event count so the row recomputes on streamed appends (eventList
    // is mutated in place) and on pooled re-point.
    eventCount?: number;
  };

  let {
    group,
    canvasWidth,
    project,
    readOnly = false,
    eventCount = 0,
  }: Props = $props();

  const timelineWidth = $derived(canvasWidth - 2 * GUTTER);
  const pendingActivity = $derived(group?.pendingActivity);

  // Reactive (not untrack) so a re-pointed pooled row relabels for its new group.
  const accessibleName = $derived(
    translate('events.row-accessible-name', {
      eventType: group.displayName,
      classification: getEventClassificationLabel(
        group.finalClassification || group.classification,
      ),
    }),
  );
  const pauseTime = $derived(
    pendingActivity && pendingActivity.pauseInfo?.pauseTime,
  );

  let decodedLocalActivity: SummaryAttribute | undefined =
    $state.raw(undefined);

  // Keyed on group (not onMount) so it re-runs on pooled re-point; reuses a
  // value already decoded onto the group, otherwise decodes once.
  $effect(() => {
    const currentGroup = group;
    decodedLocalActivity = currentGroup.decodedLocalActivity;
    if (currentGroup.category !== 'local-activity') return;
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
    events: EventGroup['eventList'],
    count: number,
  ) => {
    // Loop to `count` (not events.map) to depend on eventCount without allocating.
    const points: number[] = [];
    const pointCount = Math.min(count, events.length);
    for (let idx = 0; idx < pointCount; idx++) {
      points.push(Math.round(project(events[idx].eventTime)));
    }
    if (pauseTime) {
      points.push(Math.round(project(pauseTime)));
    }
    const { textAnchor, textPosition } = timelineTextPosition(
      points,
      ROW_HEIGHT / 2,
      timelineWidth,
      group.isPending,
    );
    return { points, textAnchor, textPosition };
  };

  const { points, textAnchor, textPosition } = $derived(
    getDistancePointsAndPositions(timelineWidth, group.eventList, eventCount),
  );

  const onClick = () => {
    if (readOnly) return;
    setActiveGroup(group);
  };

  // Only activity groups carry an ActivityTaskStarted event; guard so other
  // categories don't scan their whole eventList every re-point for nothing.
  const activityTaskScheduled = $derived(
    group.category === 'activity'
      ? group.eventList.find(isActivityTaskStartedEvent)
      : undefined,
  );
  const retryAttempt = $derived(
    activityTaskScheduled?.attributes?.attempt ?? 0,
  );
  const retried = $derived(retryAttempt > 1);

  const lineColor = $derived(
    strokeColor({
      category: group.category,
      classification: group.lastEvent.classification,
    }),
  );
  const showRetryGradient = $derived(
    retried && group.lastEvent.classification === 'Completed',
  );
  const scheduling = $derived(group.lastEvent.classification === 'Completed');

  const pendingLineColor = $derived(
    strokeColor({
      category: pendingActivity
        ? (pendingActivity.attempt ?? 0) > 1
          ? 'retry'
          : 'pending'
        : group.category,
      classification: group.lastEvent.classification,
    }),
  );

  // The button spans just the dots + connectors; its coords are button-local
  // (offset by spanLeft). Hover/focus highlight is CSS-only (no JS state).
  const HALO = RADIUS * 1.5;
  // Highlight corner radius, concentric with the dots' rounded corners.
  const highlightRadius = RADIUS * 0.8;
  const spanLeft = $derived(points[0] - HALO);
  const spanWidth = $derived(
    (group.isPending && canvasWidth - points[0] - HALO) ||
      (points.length >= 2
        ? points[points.length - 1] - points[0] + RADIUS * 3
        : RADIUS * 3),
  );
  const spanCy = HALO; // button-local vertical center
</script>

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
  },
)}
  {@const bounds = lineBox([leftX, spanCy], [rightX, spanCy])}
  <div
    class="tl-line absolute"
    class:tl-line--gradient={opts.gradient}
    class:tl-line--dashed={opts.dashed}
    class:tl-line--animate={opts.animate}
    style:left="{bounds.left}px"
    style:top="{bounds.top}px"
    style:width="{bounds.width}px"
    style:height="{bounds.height}px"
    style:--tl-line-color={color}
    style:opacity={opts.dim || null}
  ></div>
{/snippet}

{#snippet dot(
  pointX: number,
  colors: DotColors,
  icon: TimelineIconName | undefined,
)}
  {@const bounds = dotBox(pointX, spanCy)}
  <!-- transform (not left/top) so streaming/live reprojection composites the dot
       instead of triggering layout; anchored at 0,0 by left-0 top-0. -->
  <div
    class="absolute left-0 top-0 h-[var(--dot)] w-[var(--dot)] rounded-[var(--dot-r)] border-2 border-solid"
    style:transform="translate({bounds.left}px, {bounds.top}px)"
    style:border-color={colors.stroke}
    style:background={colors.fill}
  >
    {#if icon}
      <svg
        class="absolute left-1/2 top-1/2 h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2 text-black"
        viewBox="0 0 24 24"><use href="#ti-{icon}" /></svg
      >
    {/if}
  </div>
{/snippet}

<div class="absolute inset-0">
  <button
    type="button"
    class="event"
    aria-label={accessibleName}
    disabled={readOnly}
    style:left="{spanLeft}px"
    style:top="{ROW_HEIGHT / 2 - HALO}px"
    style:width="{spanWidth}px"
    style:height="{RADIUS * 3}px"
    onclick={onClick}
  >
    <div
      class="highlight {groupHover({ category: group.category })}"
      style:border-radius="{highlightRadius}px"
    ></div>
    {#each points as pointX, index (index)}
      {@const localX = pointX - spanLeft}
      {@const nextPoint = points[index + 1]}
      {#if nextPoint}
        {@render connector(localX, nextPoint - spanLeft, lineColor, {
          gradient: showRetryGradient,
          dim: scheduling && index === 0 ? 0.35 : undefined,
        })}
      {/if}
      {#if !nextPoint && group.isPending && !pauseTime}
        {@render connector(
          localX,
          canvasWidth - GUTTER - spanLeft,
          pendingLineColor,
          {
            dashed: true,
            animate: true,
          },
        )}
        {@render dot(
          localX,
          dotColors(group.lastEvent.classification),
          'retry',
        )}
      {/if}
      {@render dot(
        localX,
        dotColors(group.eventList[index]?.classification),
        pauseTime && index !== 0
          ? 'pause'
          : decodedLocalActivity
            ? CategoryIcon['local-activity'].name
            : CategoryIcon[group.category].name,
      )}
    {/each}
    <!-- Inside the button so hovering/clicking the label hits the same target;
         positioned button-local (offset by spanLeft), may overflow the box. -->
    <PayloadSummary
      value={group?.userMetadata?.summary}
      prefix={isActivityTaskScheduledEvent(group.initialEvent)
        ? group?.displayName
        : ''}
      fallback={decodedLocalActivity
        ? translate('events.category.local-activity')
        : group?.displayName}
    >
      {#snippet children(decodedValue)}
        {@const iconName =
          (pendingActivity && !pendingActivity.paused) || retried
            ? 'retry'
            : undefined}
        <div
          class="pointer-events-auto absolute flex select-none items-center gap-1 whitespace-nowrap text-[13px] leading-none {textAnchor ===
          'end'
            ? '-translate-x-full -translate-y-1/2 flex-row-reverse'
            : '-translate-y-1/2'}"
          style:left="{textPosition[0] - spanLeft}px"
          style:top="{spanCy}px"
        >
          {#if iconName}
            <svg class="h-[14px] w-[14px] text-current" viewBox="0 0 24 24">
              <use href="#ti-{iconName}" />
            </svg>
          {/if}
          <span
            class="inline-flex min-h-[var(--dot)] items-center rounded-full bg-[rgb(var(--color-surface-primary))] px-1.5 text-current"
          >
            {#if pendingActivity}
              {translate('workflows.attempt')}
              {pendingActivity.attempt} / {pendingActivity.maximumAttempts ||
                '∞'}
              •&nbsp;{decodedValue}
            {:else if retried}
              {retryAttempt} • {decodedValue}
            {:else if decodedLocalActivity}
              {decodedLocalActivity.value}
            {:else}
              {decodedValue}
            {/if}
          </span>
        </div>
      {/snippet}
    </PayloadSummary>
  </button>
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
