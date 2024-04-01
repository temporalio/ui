<script lang="ts">
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import { setSingleActiveEvent } from '$lib/stores/active-events';
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
  import GroupDetailsRow from './group-details-row.svelte';
  import Text from './text.svelte';

  export let event: WorkflowEvent;
  export let group: EventGroup;
  export let history: WorkflowEvents;
  export let groups: EventGroups;
  export let activeEvents: string[] = [];

  export let canvasWidth: number;
  export let index: number;

  const { height, radius } = HistoryConfig;

  $: ({ y } = getNextDistanceAndOffset(
    history,
    event,
    index,
    groups,
    height,
    activeEvents,
  ));

  $: noActives = !activeEvents.length;
  $: isActiveEvent = activeEvents[0] === event.id;
  $: showTimestamp = canvasWidth > 1200;
  $: showDetails = canvasWidth > 800;
  $: classification = group?.pendingActivity
    ? group.pendingActivity.attempt > 1
      ? 'retry'
      : 'pending'
    : event.classification;

  $: width = canvasWidth / 4;
</script>

<g
  role="button"
  tabindex="0"
  on:click|preventDefault={() => setSingleActiveEvent(event)}
  on:keypress={() => setSingleActiveEvent(event)}
  class="relative cursor-pointer"
>
  <Box
    point={[width + 2, y - height / 2]}
    width={canvasWidth - width - radius / 2}
    {height}
    {classification}
    fill={index % 2 === 1 && '#1E293B'}
  />
  <Text
    point={[width + 5, y]}
    active={noActives || isActiveEvent}
    fontSize="12px"
  >
    <tspan fill="#aebed9">{event.id}</tspan>
  </Text>
  <Text
    point={[width + 50, y]}
    category={event.category}
    active={noActives || isActiveEvent}
    icon={CategoryIcon[event.category]}
    config={HistoryConfig}
  >
    <tspan fill="#fff">
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
    <Text point={[canvasWidth - 1.5 * radius, y]} textAnchor="end">
      <tspan fill="#aebed9" font-size="12px">
        {formatDate(event?.eventTime, $timeFormat, {
          relative: $relativeTime,
        })}</tspan
      ></Text
    >
  {/if}
</g>
{#if isActiveEvent}
  <GroupDetailsRow
    y={y + height / 2}
    x={width + 2}
    {event}
    {group}
    {canvasWidth}
  />
{/if}

<style lang="postcss">
  g {
    outline: none;
  }
</style>
