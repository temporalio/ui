<script lang="ts">
  import type { Timestamp } from '@temporalio/common';

  import MetadataDecoder from '$lib/components/event/metadata-decoder.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { setActiveGroup } from '$lib/stores/active-events';
  import { getMillisecondDuration } from '$lib/utilities/format-time';
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

  let { height, gutter, radius } = TimelineConfig;

  $: timelineWidth = canvasWidth - 2 * gutter;
  $: active = !activeGroups.length || activeGroups.includes(group.id);
  $: pendingActivity = group?.pendingActivity;

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

  let strokeWidth = radius;

  $: activityTaskScheduled = group.eventList.find(isActivityTaskStartedEvent);
  $: retried =
    activityTaskScheduled && activityTaskScheduled.attributes?.attempt > 1;
</script>

<g
  role="button"
  tabindex="0"
  on:click|preventDefault={onClick}
  on:keypress|preventDefault={onClick}
  class="{!readOnly && 'svg-element-shadow cursor-pointer'} relative"
  class:active={!readOnly && activeGroups.includes(group.id)}
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
        {strokeWidth}
        scheduling={index === 0 &&
          group.lastEvent.classification === 'Completed'}
        {retried}
      />
    {/if}
    {#if !nextPoint && group.isPending}
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
        {strokeWidth}
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
          icon={retried ? 'retry' : undefined}
        >
          {#if retried}
            {activityTaskScheduled.attributes.attempt} • {decodedValue}
          {:else}
            {decodedValue}
          {/if}
        </Text>
      </MetadataDecoder>
    {/if}
    <Dot
      point={[x, y]}
      classification={group.eventList[index]?.classification}
      icon={CategoryIcon[group.category]}
      r={radius / 1.5}
    />
  {/each}
</g>

<style lang="postcss">
  g {
    pointer-events: bounding-box;
    outline: none;
  }

  .svg-element-shadow {
    filter: drop-shadow(0 0 2px rgb(0 0 0 / 10%));
    transition: filter 0.3s ease-in-out;
  }

  .svg-element-shadow:hover,
  .active {
    filter: drop-shadow(0 0 4px rgb(120 90 150 / 65%));
  }
</style>
