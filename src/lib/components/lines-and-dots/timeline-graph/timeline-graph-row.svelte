<script lang="ts">
  import { cva } from 'class-variance-authority';
  import { onMount, untrack } from 'svelte';

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

  import {
    CategoryIcon,
    TimelineConfig,
    timelineTextPosition,
  } from '../constants';
  import Dot from '../svg/dot.svelte';
  import Line from '../svg/line.svelte';
  import Text from '../svg/text.svelte';

  type Props = {
    y: number;
    group: EventGroup;
    canvasWidth: number;
    project: (time: ValidTime | undefined | null) => number;
    readOnly: boolean;
  };

  let {
    y = 0,
    group,
    canvasWidth,
    project,
    readOnly = false,
  }: Props = $props();

  const { height, gutter, radius } = TimelineConfig;

  let hovering = $state(false);
  let focused = $state(false);

  const timelineWidth = $derived(canvasWidth - 2 * gutter);
  const pendingActivity = $derived(group?.pendingActivity);

  // group.displayName and group.classification are set at group creation and
  // never mutated — the parent's {#key group.eventList.length} destroys and
  // recreates this component whenever classification changes (e.g. activity
  // completes), so the fresh values are always picked up on remount.
  // untrack() silences Svelte's "only captures initial value" warning while
  // explicitly communicating that the snapshot is intentional.
  const accessibleName = untrack(() =>
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

  let decodedLocalActivity: SummaryAttribute | undefined = $state(undefined);

  onMount(async () => {
    if (group.category !== 'local-activity') return;
    const localActivityEvent = getLocalActivityMarkerEvent(group);
    if (localActivityEvent) {
      try {
        decodedLocalActivity = await decodeLocalActivity(localActivityEvent);

        if (decodedLocalActivity) {
          group.decodedLocalActivity = decodedLocalActivity;
        }
      } catch (error) {
        console.warn('Failed to decode local activity:', error);
      }
    }
  });

  const getDistancePointsAndPositions = (timelineWidth: number, y: number) => {
    const points = group.eventList.map((event) =>
      Math.round(project(event.eventTime)),
    );

    if (pauseTime) {
      points.push(Math.round(project(pauseTime)));
    }

    const { textAnchor, textIndex, textPosition, backdrop } =
      timelineTextPosition(
        points,
        y,
        timelineWidth,
        group.isPending,
        TimelineConfig,
      );

    return { points, textAnchor, textIndex, textPosition, backdrop };
  };

  const { points, textAnchor, textIndex, textPosition, backdrop } = $derived(
    getDistancePointsAndPositions(timelineWidth, y),
  );

  const onClick = () => {
    if (readOnly) return;
    setActiveGroup(group);
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  const onMouseEnter = () => {
    if (readOnly) return;
    hovering = true;
  };

  const onMouseLeave = () => {
    if (readOnly) return;
    hovering = false;
  };

  const onFocus = (event: FocusEvent) => {
    if (readOnly) return;
    focused = (event.currentTarget as Element)?.matches(':focus-visible');
  };

  const onBlur = () => {
    focused = false;
  };

  const activityTaskScheduled = $derived(
    group.eventList.find(isActivityTaskStartedEvent),
  );
  const retryAttempt = $derived(
    activityTaskScheduled?.attributes?.attempt ?? 0,
  );
  const retried = $derived(retryAttempt > 1);
  const pendingLine = $derived(group.isPending || !!pauseTime);

  const groupHover = cva(['h-full w-full rounded-full border-2'], {
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

{#if hovering || focused}
  {@const multiEventHoverWidth =
    points.length >= 2 && points[points.length - 1] - points[0] + radius * 3}
  {@const hoverWidth =
    (group.isPending && canvasWidth - points[0] - radius * 1.5) ||
    multiEventHoverWidth ||
    radius * 3}
  <foreignObject
    x={points[0] - radius * 1.5}
    y={y - radius * 1.5}
    width={hoverWidth}
    height={radius * 3}
  >
    <div
      class={groupHover({
        category: group ? group.category : 'default',
      })}
    ></div>
  </foreignObject>
{/if}
<g
  role="button"
  tabindex="0"
  aria-label={accessibleName}
  onclick={onClick}
  onkeydown={onKeydown}
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
  onfocus={onFocus}
  onblur={onBlur}
  class="relative cursor-pointer"
  {height}
>
  {#if pendingLine}
    {@const width = pauseTime
      ? points[1] - points[0]
      : canvasWidth - 2 * gutter}
    <rect
      y={y - height / 2}
      x={points[0]}
      {width}
      {height}
      fill="transparent"
      pointer-events="all"
    />
  {/if}
  {#each points as x, index (index)}
    {@const nextPoint = points[index + 1]}
    {@const showText = textIndex === index}
    {#if nextPoint}
      <Line
        startPoint={[x, y]}
        endPoint={[nextPoint, y]}
        category={group.category}
        classification={group.lastEvent.classification}
        pending={!!pauseTime}
        paused={!!pauseTime}
        strokeWidth={radius * 2}
        {retried}
        scheduling={index === 0 &&
          group.lastEvent.classification === 'Completed'}
      />
    {/if}
    {#if !nextPoint && group.isPending && !pauseTime}
      <Line
        startPoint={[x, y]}
        endPoint={[canvasWidth - gutter, y]}
        category={pendingActivity
          ? (pendingActivity.attempt ?? 0) > 1
            ? 'retry'
            : 'pending'
          : group.category}
        classification={group.lastEvent.classification}
        pending
        paused={!!pauseTime}
        strokeWidth={radius * 2}
      />
      <Dot
        point={[x, y]}
        classification={group.lastEvent.classification}
        icon="retry"
        r={radius}
      />
    {/if}
    {#if showText}
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
          <Text
            point={textPosition}
            {textAnchor}
            {backdrop}
            backdropHeight={radius * 2}
            config={TimelineConfig}
            icon={(pendingActivity && !pendingActivity.paused) || retried
              ? 'retry'
              : undefined}
          >
            {#if pendingActivity}
              {translate('workflows.attempt')}
              {pendingActivity.attempt} / {pendingActivity.maximumAttempts ||
                '∞'}
              {'• '}
              {decodedValue}
            {:else if retried}
              {retryAttempt} • {decodedValue}
            {:else if decodedLocalActivity}
              {decodedLocalActivity.value}
            {:else}
              {decodedValue}
            {/if}
          </Text>
        {/snippet}
      </PayloadSummary>
    {/if}
    <Dot
      point={[x, y]}
      classification={group.eventList[index]?.classification}
      icon={pauseTime && index !== 0
        ? 'pause'
        : decodedLocalActivity
          ? CategoryIcon['local-activity'].name
          : CategoryIcon[group.category].name}
      r={radius}
    />
  {/each}
</g>

<style lang="postcss">
  g {
    pointer-events: bounding-box;
    outline: none;
  }
</style>
