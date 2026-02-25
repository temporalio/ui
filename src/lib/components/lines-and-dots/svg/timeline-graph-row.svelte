<script lang="ts">
  import type { Timestamp } from '@temporalio/common';
  import { cva } from 'class-variance-authority';
  import { onMount } from 'svelte';

  import { page } from '$app/state';

  import MetadataDecoder from '$lib/components/event/metadata-decoder.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { setActiveGroup } from '$lib/stores/active-events';
  import { authUser } from '$lib/stores/auth-user';
  import {
    decodeLocalActivity,
    getLocalActivityMarkerEvent,
  } from '$lib/utilities/decode-local-activity';
  import { getMillisecondDuration } from '$lib/utilities/format-time';
  import type { SummaryAttribute } from '$lib/utilities/get-single-attribute-for-event';
  import {
    isActivityTaskScheduledEvent,
    isActivityTaskStartedEvent,
  } from '$lib/utilities/is-event-type';

  import {
    CategoryIcon,
    TimelineConfig,
    timelineTextPosition,
  } from '../constants';

  import Dot from './dot.svelte';
  import Line from './line.svelte';
  import Text from './text.svelte';

  type Props = {
    y: number;
    group: EventGroup;
    startTime: string | Timestamp;
    endTime: string | Date;
    canvasWidth: number;
    readOnly: boolean;
  };

  let {
    y = 0,
    group,
    startTime,
    endTime,
    canvasWidth,
    readOnly = false,
  }: Props = $props();

  const { height, gutter, radius } = TimelineConfig;

  let hovering = $state(false);

  const timelineWidth = $derived(canvasWidth - 2 * gutter);
  const pendingActivity = $derived(group?.pendingActivity);
  const pauseTime = $derived(
    pendingActivity && pendingActivity.pauseInfo?.pauseTime,
  );

  let decodedLocalActivity: SummaryAttribute | undefined = $state(undefined);

  onMount(async () => {
    const localActivityEvent = getLocalActivityMarkerEvent(group);
    if (localActivityEvent) {
      try {
        decodedLocalActivity = await decodeLocalActivity(localActivityEvent, {
          namespace: page.params.namespace,
          settings: page.data.settings,
          accessToken: $authUser.accessToken,
        });

        if (decodedLocalActivity) {
          group.decodedLocalActivity = decodedLocalActivity;
        }
      } catch (error) {
        console.warn('Failed to decode local activity:', error);
      }
    }
  });

  const getDistancePointsAndPositions = (
    endTime: string | Date,
    timelineWidth: number,
    y: number,
  ) => {
    const workflowDistance = getMillisecondDuration({
      start: startTime,
      end: endTime,
      onlyUnderSecond: false,
    });

    const points = group.eventList.map((event) => {
      const distance = getMillisecondDuration({
        start: startTime,
        end: event.eventTime,
        onlyUnderSecond: false,
      });

      const ratio = distance / workflowDistance;
      return Math.round(ratio * timelineWidth) + gutter;
    });

    if (pauseTime) {
      const distance = getMillisecondDuration({
        start: startTime,
        end: pauseTime,
        onlyUnderSecond: false,
      });

      const ratio = distance / workflowDistance;
      const pausePoint = Math.round(ratio * timelineWidth) + gutter;
      points.push(pausePoint);
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
    getDistancePointsAndPositions(endTime, timelineWidth, y),
  );

  const onClick = () => {
    if (readOnly) return;
    setActiveGroup(group);
  };

  const onMouseEnter = () => {
    if (readOnly) return;
    hovering = true;
  };

  const onMouseLeave = () => {
    if (readOnly) return;
    hovering = false;
  };

  const activityTaskScheduled = $derived(
    group.eventList.find(isActivityTaskStartedEvent),
  );
  const retried = $derived(
    activityTaskScheduled && activityTaskScheduled.attributes?.attempt > 1,
  );
  const pendingLine = $derived(group.isPending || !!pauseTime);

  const multiEventHoverWidth = $derived(
    points.length >= 2 && points[points.length - 1] - points[0] + radius * 3,
  );
  const pendingHoverWidth = $derived(
    group.isPending && canvasWidth - points[0] - radius * 1.5,
  );
  const singleEventHoverWidth = $derived(radius * 3);

  const hoverWidth = $derived(
    pendingHoverWidth || multiEventHoverWidth || singleEventHoverWidth,
  );

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

{#if hovering}
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
  onclick={onClick}
  onkeypress={onClick}
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
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
  {#each points as x, index}
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
          ? pendingActivity.attempt > 1
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
      <MetadataDecoder
        value={group?.userMetadata?.summary}
        prefix={isActivityTaskScheduledEvent(group.initialEvent)
          ? group?.displayName
          : ''}
        fallback={decodedLocalActivity
          ? translate('events.category.local-activity')
          : group?.displayName}
        let:decodedValue
      >
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
            {pendingActivity.attempt} / {pendingActivity.maximumAttempts || '∞'}
            {'• '}
            {decodedValue}
          {:else if retried}
            {activityTaskScheduled.attributes.attempt} • {decodedValue}
          {:else if decodedLocalActivity}
            {decodedLocalActivity.value}
          {:else}
            {decodedValue}
          {/if}
        </Text>
      </MetadataDecoder>
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
