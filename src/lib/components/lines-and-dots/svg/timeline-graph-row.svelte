<script lang="ts">
  import type { Timestamp } from '@temporalio/common';

  import MetadataDecoder from '$lib/components/event/metadata-decoder.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { setActiveGroup } from '$lib/stores/active-events';
  import { getMillisecondDuration } from '$lib/utilities/format-time';
  import { isActivityTaskScheduledEvent } from '$lib/utilities/is-event-type';

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
</script>

<g
  role="button"
  tabindex="0"
  on:click|preventDefault={onClick}
  on:keypress|preventDefault={onClick}
  class="relative cursor-pointer"
  {height}
>
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
    {/if}
    {#if showText}
      <MetadataDecoder
        value={group?.userMetadata?.summary}
        prefix={isActivityTaskScheduledEvent(group.initialEvent)
          ? group?.displayName
          : ''}
        fallback={group?.displayName}
        let:decodedValue
      >
        <Text
          point={textPosition}
          {textAnchor}
          {backdrop}
          backdropHeight={radius * 2}
          config={TimelineConfig}
          icon={pendingActivity ? 'retry' : undefined}
        >
          {#if pendingActivity}
            {translate('workflows.attempt')}
            {pendingActivity.attempt} / {pendingActivity.maximumAttempts || '∞'}
            {'• '}
          {/if}
          {decodedValue}
        </Text>
      </MetadataDecoder>
    {/if}
    <Dot
      point={[x, y]}
      classification={group.eventList[index]?.classification}
      icon={pauseTime && index !== 0 ? 'pause' : CategoryIcon[group.category]}
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
