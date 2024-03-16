<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';

  import { CategoryIcon, TimelineConfig } from '../constants';

  import Dot from './dot.svelte';
  import Line from './line.svelte';
  import Text from './text.svelte';

  export let groups: EventGroup[];
  export let group: EventGroup;
  export let index: number;
  export let canvasWidth: number;
  export let active = true;
  export let onClick: () => void;

  const { gap, gutter, radius } = TimelineConfig;

  $: y = gap + gap / 2;

  $: timelineWidth = canvasWidth - 2 * gutter;
  $: length = timelineWidth / groups.length;
  $: start = gutter + index * length;
  $: end = start + length;
</script>

<g
  role="button"
  tabindex="0"
  on:click|preventDefault={onClick}
  on:keypress={onClick}
  class="relative cursor-pointer"
  height={gap}
  transform="matrix(1 0 0 1 0 0)"
>
  <Line
    startPoint={[start, y]}
    endPoint={[end, y]}
    category={group?.pendingActivity
      ? group.pendingActivity.attempt > 1
        ? 'retry'
        : 'pending'
      : group.category}
    classification={group.lastEvent.classification}
    {active}
    strokeWidth={radius * 2}
    scheduling={index === 0 && group.lastEvent.classification === 'Completed'}
  />
  <Dot
    point={[start, y]}
    category={group.category}
    classification={group.lastEvent.classification}
    {active}
    r={radius}
  />
  <Icon
    name={CategoryIcon[group.category]}
    x={start - radius}
    y={y - radius}
    width={radius * 2}
    height={radius * 2}
    strokeWidth="4"
  />
  <Text vertical point={[start, y + radius * 1.75]} {active}>
    {group?.name}
  </Text>
</g>

<style lang="postcss">
  g {
    pointer-events: bounding-box;
    outline: none;
  }
</style>
