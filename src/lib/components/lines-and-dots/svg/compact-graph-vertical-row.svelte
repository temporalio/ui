<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';

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
  const { radius, height } = CompactConfig;
  $: start = 4 * radius + startIndex * length + 200;
  $: end = start + length;
  $: aggregateRow = count > 1;
  $: isPending = group.isPending && !aggregateRow;
</script>

<g
  role="button"
  tabindex="0"
  on:click={onClick}
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
  <Line
    startPoint={[start, y]}
    endPoint={[end, y]}
    {active}
    status="none"
    strokeWidth={radius}
  />
  <Text point={[start + (4 / 3) * radius, y]} {active} fontWeight="500">
    {#if aggregateRow}<tspan font-weight="700">{count}</tspan>{/if}
    {group?.displayName}
  </Text>
  <Dot
    point={[start, y]}
    classification={aggregateRow ? undefined : group.lastEvent.classification}
    {active}
    r={radius}
  />
  {#if aggregateRow}
    <Icon
      name={CategoryIcon[group.category]}
      x={start - radius / 2}
      y={y - radius / 2}
      width={radius}
      height={radius}
      class="text-black"
    />
    <Icon
      name={expanded ? 'chevron-up' : 'chevron-down'}
      x={start - radius / 3}
      y={y + radius / 3.33}
      width={radius / 1.5}
      height={radius / 1.5}
      class="text-black"
    />
  {:else}
    <Icon
      name={CategoryIcon[group.category]}
      x={start - radius / 2}
      y={y - radius / 2}
      width={radius}
      height={radius}
      class="text-black"
    />
  {/if}
  <Dot
    point={[end, y]}
    classification={aggregateRow ? undefined : group.lastEvent.classification}
    {active}
    r={radius}
  />
  <Icon
    name={CategoryIcon[group.category]}
    x={end - radius / 2}
    y={y - radius / 2}
    width={radius}
    height={radius}
    class="text-black"
  />
</g>

<style lang="postcss">
  g {
    outline: none;
  }
</style>
