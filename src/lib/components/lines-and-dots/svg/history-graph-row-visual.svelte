<script lang="ts">
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvent } from '$lib/types/events';
  import { isPendingActivity } from '$lib/utilities/is-pending-activity';

  import { HistoryConfig, isMiddleEvent, isPendingGroup } from '../constants';

  import Dot from './dot.svelte';
  import Line from './line.svelte';

  export let event: WorkflowEvent;
  export let group: EventGroup;
  export let groups: EventGroups;

  export let nextDistance: number;
  export let offset: number;
  export let y: number;
  export let canvasWidth: number;
  export let startingX: number;
  export let active = false;
  export let zoomLevel: number = 1;

  const { radius } = HistoryConfig;

  $: category = isPendingActivity(event) ? 'pending' : event?.category;
  $: classification = isPendingActivity(event)
    ? 'pending'
    : event?.classification;
  $: connectLine = isPendingActivity(event)
    ? false
    : !isMiddleEvent(event, groups);

  const strokeWidth = radius / 2;
  $: horizontalOffset = (offset / 1.5) * 3 * radius;
  $: nextIsPending = group?.lastEvent.id === event?.id && isPendingGroup(group);

  $: withinCanvas = (x: number) => {
    return x <= canvasWidth * zoomLevel;
  };
</script>

{#if connectLine}
  <Line
    startPoint={[startingX + strokeWidth, y]}
    endPoint={[startingX + horizontalOffset - radius, y]}
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
