<script lang="ts">
  import type { Timestamp } from '@temporalio/common';
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
    hasLocalActivityMarker,
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

  export let y = 0;
  export let group: EventGroup;
  export let activeGroups: string[] = [];
  export let startTime: string | Timestamp;
  export let endTime: string | Date;
  export let canvasWidth: number;
  export let active = true;
  export let readOnly = false;

  const { height, gutter, radius } = TimelineConfig;

  $: timelineWidth = canvasWidth - 2 * gutter;
  $: active = !activeGroups.length || activeGroups.includes(group.id);
  $: pendingActivity = group?.pendingActivity;
  $: pauseTime = pendingActivity && pendingActivity.pauseInfo?.pauseTime;

  let decodedLocalActivity: SummaryAttribute | undefined;

  onMount(async () => {
    if (hasLocalActivityMarker(group)) {
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

  $: ({ points, textAnchor, textIndex, textPosition, backdrop } =
    getDistancePointsAndPositions(endTime, timelineWidth, y));

  const onClick = () => {
    if (readOnly) return;
    setActiveGroup(group);
  };

  $: activityTaskScheduled = group.eventList.find(isActivityTaskStartedEvent);
  $: retried =
    activityTaskScheduled && activityTaskScheduled.attributes?.attempt > 1;
  $: pendingLine = group.isPending || !!pauseTime;
</script>

<g
  role="button"
  tabindex="0"
  on:click={onClick}
  on:keypress={onClick}
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
        icon={'retry'}
        r={radius}
      />
    {/if}
    {#if showText}
      <MetadataDecoder
        value={group?.userMetadata?.summary}
        prefix={isActivityTaskScheduledEvent(group.initialEvent)
          ? group?.displayName
          : ''}
        fallback={decodedLocalActivity ? translate('events.category.local-activity') : group?.displayName}
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
          ? CategoryIcon['local-activity']
          : CategoryIcon[group.category]}
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
