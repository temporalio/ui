<script lang="ts">
  import type {
    EventTypeCategory,
    PendingActivity,
    WorkflowEvent,
  } from '$lib/types/events';
  import { isPendingActivity } from '$lib/utilities/is-pending-activity';

  import { getEventCategoryColor, HistoryConfig } from '../constants';

  import Layer from './layer.svelte';
  import Line from './line.svelte';

  export let canvasWidth: number;
  export let y: number = 20;
  export let category: EventTypeCategory | 'pending';

  export let event: WorkflowEvent | PendingActivity;

  export let nextDistance = 0;
  export let offset = 1;
  export let connectLine = false;
  export let onClick: (x: WorkflowEvent | PendingActivity) => void;

  const { radius } = HistoryConfig;

  $: horizontalOffset =
    category === 'workflow' ? 0 : (offset / 1.5) * 3 * radius;

  $: startingX = canvasWidth / 2;
  $: x = startingX + horizontalOffset;

  // $: nextIsPending =
  //   group?.lastEvent.id === event?.id && group?.pendingActivity;

  $: render = ({ context }) => {
    context.globalCompositeOperation = 'screen';
    context.fillStyle = getEventCategoryColor(
      isPendingActivity(event) ? 'pending' : event.category,
    );
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  };

  const onDown = (e) => {
    e.detail.originalEvent.preventDefault();
    onClick(event);
    // dragging = true;
    // radius.set(120);
  };
</script>

{#if category !== 'workflow' && connectLine}
  <Line x1={startingX} x2={x - radius} y1={y} y2={y} {category} />
{/if}
<Layer
  {render}
  on:mouseenter
  on:mouseleave
  on:mousedown={onDown}
  on:mousedown
  on:mousemove
  on:mouseup
  on:touchstart={onDown}
  on:touchstart
  on:touchmove
  on:touchend
/>
{#if nextDistance}
  <Line
    x1={startingX + horizontalOffset}
    x2={startingX + horizontalOffset}
    y1={y + radius}
    y2={y + nextDistance - radius}
    {category}
  />
{/if}
