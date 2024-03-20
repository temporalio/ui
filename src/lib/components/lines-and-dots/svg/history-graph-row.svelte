<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type {
    PendingActivity,
    WorkflowEvent,
    WorkflowEvents,
  } from '$lib/types/events';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import { isPendingActivity } from '$lib/utilities/is-pending-activity';

  import {
    CategoryIcon,
    getNextDistanceAndOffset,
    HistoryConfig,
    isMiddleEvent,
    isPendingGroup,
  } from '../constants';

  import Box from './box.svelte';
  import Dot from './dot.svelte';
  import Line from './line.svelte';
  import Text from './text.svelte';

  export let event: WorkflowEvent | PendingActivity;
  export let group: EventGroup;
  export let history: WorkflowEvents;
  export let groups: EventGroups;
  export let pendingActivities: PendingActivity[];

  export let canvasWidth: number;
  export let startingX: number;
  export let active = false;
  export let onClick: (x: WorkflowEvent | PendingActivity) => void;
  export let index: number;
  export let zoomLevel: number = 1;

  const { height, radius } = HistoryConfig;

  $: category = isPendingActivity(event) ? 'pending' : event?.category;
  $: classification = isPendingActivity(event)
    ? 'pending'
    : event?.classification;
  $: connectLine = isPendingActivity(event)
    ? false
    : !isMiddleEvent(event, groups);

  $: ({ nextDistance, offset, y } = getNextDistanceAndOffset(
    history,
    event,
    index,
    groups,
    pendingActivities,
    height,
  ));

  const strokeWidth = radius / 2;
  $: horizontalOffset =
    category === 'workflow' ? 0 : (offset / 1.5) * 3 * radius;
  $: nextIsPending = group?.lastEvent.id === event?.id && isPendingGroup(group);

  $: withinCanvas = (x: number) => {
    return x <= canvasWidth * zoomLevel;
  };
</script>

<g
  role="button"
  tabindex="0"
  on:click|preventDefault={() => onClick(event)}
  on:keypress={() => onClick(event)}
  class="relative cursor-pointer"
>
  <Box
    point={[0, y - height / 2]}
    width={startingX - strokeWidth}
    {height}
    fill={index % 2 === 1 && '#1E293B'}
  />
  {#if isPendingActivity(event)}
    <Text point={[60, y + 5]} category="pending" {active}>Pending Activity</Text
    >
  {:else}
    <Text point={[5, y + 5]} {active}>
      <tspan fill="#aebed9">{event.id}</tspan>
    </Text>
    <Icon
      name={CategoryIcon[category]}
      x={60}
      y={y - radius}
      width={radius * 2}
      height={radius * 2}
      class="text-white"
    />
    <Text point={[60 + radius * 2.5, y + 5]} {category} {active}>
      <tspan fill="#fff">
        {spaceBetweenCapitalLetters(event?.name)}
      </tspan>
      {#if group}<tspan dx={3} font-size="14px">{group.name}</tspan>{/if}
    </Text>
    <Text
      point={[startingX - 1.5 * radius, y + radius / 2]}
      {active}
      position="end"
    >
      <tspan fill="#fff" font-size="12px">
        {formatDate(event?.eventTime, $timeFormat, {
          relative: $relativeTime,
        })}
        <tspan fill="#fff"> </tspan></tspan
      ></Text
    >
  {/if}
  {#if connectLine}
    <Line
      startPoint={[startingX + strokeWidth, y]}
      endPoint={[startingX + horizontalOffset - radius, y]}
      {category}
      {active}
    />
  {/if}
  {#if withinCanvas(startingX + horizontalOffset)}
    <Dot point={[startingX + horizontalOffset, y]} {classification} {active} />
  {/if}
  {#if nextDistance && withinCanvas(startingX + horizontalOffset + radius)}
    <Line
      startPoint={[
        startingX + horizontalOffset + radius / 2 - strokeWidth,
        y + radius + strokeWidth / 2,
      ]}
      endPoint={[
        startingX + horizontalOffset + radius / 2 - strokeWidth,
        y + nextDistance - radius,
      ]}
      category={group?.pendingActivity
        ? group.pendingActivity.attempt > 1
          ? 'retry'
          : 'pending'
        : category}
      {active}
      pending={nextIsPending}
    />
  {/if}
</g>

<style lang="postcss">
  g {
    outline: none;
  }
</style>
