<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { setActiveEvent } from '$lib/stores/active-events';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { WorkflowEvent } from '$lib/types/events';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import { isLocalActivityMarkerEvent } from '$lib/utilities/is-event-type';

  import { CategoryIcon, HistoryConfig } from '../constants';

  import Box from './box.svelte';
  import Text from './text.svelte';

  export let event: WorkflowEvent;
  export let group: EventGroup;
  export let activeEvents: string[] = [];

  export let canvasWidth: number;
  export let visualWidth: number;
  export let index: number;

  const { height, radius } = HistoryConfig;

  $: y = index * height + height / 2;
  $: noActives = !activeEvents.length;
  $: isActiveEvent = activeEvents.includes(event.id);
  $: showTimestamp = canvasWidth > 1200;
  $: showDetails = canvasWidth > 800;
  $: classification = group?.pendingActivity
    ? group.pendingActivity.attempt > 1
      ? 'retry'
      : 'pending'
    : event.classification;
  $: detailsWidth = canvasWidth - visualWidth;
  $: icon = isLocalActivityMarkerEvent(event)
    ? CategoryIcon['local-activity']
    : CategoryIcon[event.category];
</script>

<g
  role="button"
  tabindex="0"
  on:click|preventDefault={() => setActiveEvent(event, group)}
  on:keypress={() => setActiveEvent(event, group)}
  class="relative cursor-pointer"
>
  <Box
    point={[visualWidth + 2, y - height / 2]}
    width={detailsWidth}
    {height}
    {classification}
    fill={index % 2 === 1 && '#1E293B'}
  />
  <Text
    point={[visualWidth + 2 * radius, y]}
    active={noActives || isActiveEvent}
    fontSize="12px"
  >
    {event.id}
  </Text>
  <Icon
    name={icon}
    x={visualWidth + 8 * radius}
    y={y - 1.666 * radius}
    width={radius * 3}
    height={radius * 3}
    class="text-white {!noActives && !isActiveEvent && 'opacity-[.35]'}"
  />
  <Text
    point={[visualWidth + 70, y]}
    category={event.category}
    active={noActives || isActiveEvent}
    config={HistoryConfig}
  >
    <tspan fill="#fff">
      {spaceBetweenCapitalLetters(event?.name)}
    </tspan>
    {#if group && group.displayName && showDetails}<tspan dx={3}
        >{group.displayName}</tspan
      >{/if}
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

<style lang="postcss">
  g {
    outline: none;
  }
</style>
