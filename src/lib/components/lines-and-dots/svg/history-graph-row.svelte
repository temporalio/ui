<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import { activeEvents, setActiveEvent } from '$lib/stores/active-events';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { WorkflowEvent, WorkflowEvents } from '$lib/types/events';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';

  import {
    CategoryIcon,
    getNextDistanceAndOffset,
    HistoryConfig,
  } from '../constants';

  import Box from './box.svelte';
  import HistoryGraphRowVisual from './history-graph-row-visual.svelte';
  import Text from './text.svelte';

  export let event: WorkflowEvent;
  export let group: EventGroup;
  export let history: WorkflowEvents;
  export let groups: EventGroups;

  export let canvasWidth: number;
  export let startingX: number;
  export let active = false;
  export let index: number;
  export let zoomLevel: number = 1;

  const { height, radius } = HistoryConfig;

  $: ({ nextDistance, offset, y } = getNextDistanceAndOffset(
    history,
    event,
    index,
    groups,
    $activeEvents,
    height,
  ));

  $: showTimestamp = canvasWidth > 1200;
  $: showDetails = canvasWidth > 800;
  $: classification = group?.pendingActivity
    ? group.pendingActivity.attempt > 1
      ? 'retry'
      : 'pending'
    : event.classification;
</script>

<g
  role="button"
  tabindex="0"
  on:click|preventDefault={() => setActiveEvent(event, group)}
  on:keypress={() => setActiveEvent(event, group)}
  class="relative cursor-pointer"
>
  <Box
    point={[0, y - height / 2]}
    width={startingX - radius / 2}
    {height}
    {classification}
    fill={index % 2 === 1 && '#1E293B'}
  />
  <Text point={[5, y + 5]} {active} fontSize="12px">
    <tspan fill="#aebed9">{event.id}</tspan>
  </Text>
  <Icon
    name={CategoryIcon[event.category]}
    x={50}
    y={y - radius}
    width={radius * 2}
    height={radius * 2}
    class="text-white"
  />
  <Text point={[50 + radius * 2.5, y + 5]} category={event.category} {active}>
    <tspan fill="#fff" font-size={showDetails ? '14px' : '12px'}>
      {spaceBetweenCapitalLetters(event?.name)}
    </tspan>
    {#if group && group.displayName && showDetails}<tspan dx={3}
        >{group.displayName}</tspan
      >{/if}
    <!-- <tspan dx={3}
      ><HistoryRowPayloadDetail {...getSingleAttributeForEvent(event)} /></tspan
    > -->
  </Text>
  {#if showTimestamp}
    <Text
      point={[startingX - 1.5 * radius, y + radius / 2]}
      {active}
      textAnchor="end"
    >
      <tspan fill="#aebed9" font-size="12px">
        {formatDate(event?.eventTime, $timeFormat, {
          relative: $relativeTime,
        })}</tspan
      ></Text
    >
  {/if}
  <HistoryGraphRowVisual
    {event}
    {group}
    {groups}
    {nextDistance}
    {offset}
    {y}
    {canvasWidth}
    {startingX}
    {active}
    {zoomLevel}
  />
</g>

<style lang="postcss">
  g {
    outline: none;
  }
</style>
