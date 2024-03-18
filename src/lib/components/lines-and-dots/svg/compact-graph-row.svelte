<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import {
    isStartChildWorkflowExecutionInitiatedEvent,
    isTimerStartedEvent,
  } from '$lib/utilities/is-event-type';

  import { CategoryIcon, CompactConfig } from '../constants';

  import Dot from './dot.svelte';
  import Line from './line.svelte';
  import Text from './text.svelte';

  export let group: EventGroup;
  export let count: number = 1;
  export let startIndex: number;
  export let length: number;
  export let y: number;
  export let active = true;
  export let expanded = false;
  export let onClick: () => void;

  const { gutter, radius, height } = CompactConfig;

  $: start = gutter + startIndex * length;
  $: end = start + length;
  $: aggregateRow = count > 1;

  $: isPending =
    Boolean(
      group.pendingActivity ||
        (isTimerStartedEvent(group.initialEvent) &&
          group.eventList.length === 1) ||
        (isStartChildWorkflowExecutionInitiatedEvent(group.initialEvent) &&
          group.eventList.length === 2),
    ) && !aggregateRow;
</script>

<g
  role="button"
  tabindex="0"
  on:click|preventDefault={onClick}
  on:keypress={onClick}
  class="relative cursor-pointer"
  {height}
>
  <Line
    startPoint={[start, y]}
    endPoint={[end, y]}
    category={group?.pendingActivity
      ? group.pendingActivity.attempt > 1
        ? 'retry'
        : 'pending'
      : group.category}
    classification={aggregateRow ? undefined : group.lastEvent.classification}
    {active}
    strokeWidth={radius * 2}
    pending={isPending}
  />
  <Dot
    point={[start, y]}
    category={group.category}
    classification={aggregateRow ? undefined : group.lastEvent.classification}
    {active}
    r={radius}
  />
  {#if aggregateRow}
    <Icon
      name={CategoryIcon[group.category]}
      x={start - radius / 2}
      y={y - radius / 1.5}
      width={radius}
      height={radius}
      strokeWidth="4"
    />
    <Icon
      name={expanded ? 'chevron-up' : 'chevron-down'}
      x={start - radius / 2}
      {y}
      width={radius}
      height={radius}
      strokeWidth="4"
    />
  {:else}
    <Icon
      name={CategoryIcon[group.category]}
      x={start - radius}
      y={y - radius}
      width={radius * 2}
      height={radius * 2}
      strokeWidth="4"
    />
  {/if}
  <Text
    point={[start + (4 / 3) * radius, y + radius / 4]}
    {active}
    position="middle"
  >
    {#if aggregateRow}<tspan font-weight="700">{count}</tspan>{/if}
    {group?.name}
  </Text>
</g>

<style lang="postcss">
  g {
    pointer-events: bounding-box;
    outline: none;
  }
</style>
