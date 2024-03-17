<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type {
    EventClassification,
    EventTypeCategory,
    PendingActivity,
    WorkflowEvent,
  } from '$lib/types/events';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import { isPendingActivity } from '$lib/utilities/is-pending-activity';

  import { CategoryIcon, HistoryConfig } from '../constants';

  import Box from './box.svelte';
  import Dot from './dot.svelte';
  import Line from './line.svelte';
  import Text from './text.svelte';

  export let y: number = 20;
  export let category: EventTypeCategory | 'pending';
  export let classification: EventClassification | undefined = undefined;

  export let event: WorkflowEvent | PendingActivity;
  export let group: EventGroup;

  export let canvasWidth: number;
  export let startingX: number;
  export let nextDistance = 0;
  export let offset = 1;
  export let connectLine = false;
  export let active = false;
  export let onClick: (x: WorkflowEvent | PendingActivity) => void;
  export let index: number;

  const { radius, gap } = HistoryConfig;
  const strokeWidth = radius / 2;
  $: horizontalOffset =
    category === 'workflow' ? 0 : (offset / 1.5) * 3 * radius;
  $: nextIsPending =
    group?.lastEvent.id === event?.id && group?.pendingActivity;

  $: withinCanvas = (x: number) => {
    return x <= canvasWidth;
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
    point={[0, y - gap / 2]}
    width={startingX - strokeWidth}
    height={gap}
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
      classification={group?.lastEvent?.classification}
      {active}
    />
  {/if}
  {#if withinCanvas(startingX + horizontalOffset)}
    <Dot
      point={[startingX + horizontalOffset, y]}
      {category}
      {classification}
      {active}
    />
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
      {category}
      classification={group?.lastEvent?.classification}
      {active}
      strokeDasharray={nextIsPending ? '3' : 'none'}
    />
  {/if}
</g>

<style lang="postcss">
  g {
    outline: none;
  }
</style>
