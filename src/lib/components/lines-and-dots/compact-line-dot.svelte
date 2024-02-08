<script lang="ts">
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type {
    EventClassification,
    EventTypeCategory,
    WorkflowEvent,
  } from '$lib/types/events';
  // import { capitalize } from '$lib/utilities/format-camel-case';

  export let y: number = 20;
  export let category: EventTypeCategory | 'pending';
  export let classification: EventClassification | undefined = undefined;

  export let group: EventGroup;
  export let event: WorkflowEvent;
  export let x = 0;
  export let nextX = 0;
  export let canvasWidth: number;
  export let active = false;
  export let onClick: () => void;

  const r = 3;
  const strokeWidth = 3;

  $: atTheEnd = canvasWidth - x < 200;
  $: showGroupName =
    group.eventList.length === 1 ||
    (group.eventList.length > 1 && group.lastEvent.id === event.id);
</script>

<g on:click={onClick} on:keydown={onClick}>
  <!-- {#if group}
    <text x={5} y={y + 3} class="text" class:active
      >{capitalize(group?.label || group?.category || group?.name)}</text
    >
  {/if} -->
  {#if nextX}
    <line
      class="line {category}"
      class:active
      stroke-width={strokeWidth}
      x1={x + r}
      x2={x + nextX - r}
      y1={y}
      y2={y}
    />
  {/if}
  <g>
    {#if category === 'pending'}
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="0 {x} {y}"
        to="360 {x} {y}"
        dur="2s"
        repeatCount="indefinite"
      />
    {/if}
    <circle
      class="dot {category} {classification}"
      class:active
      stroke-width={strokeWidth}
      cx={x}
      cy={y}
      {r}
    />
  </g>
  {#if showGroupName}
    <text
      x={atTheEnd ? x + r : x + 2 * r}
      text-anchor={atTheEnd ? 'end' : 'start'}
      y={atTheEnd ? y + r * 5 : y + r}
      class="text"
      class:active>{group?.name}</text
    >
  {/if}
</g>

<style lang="postcss">
  g {
    outline: none;
  }

  .line,
  .dot,
  .text {
    cursor: pointer;
    opacity: 0.25;
    outline: none;
  }

  .text {
    fill: white;
    font-size: 10px;
  }

  .dot {
    fill: #2d323e;
    z-index: 2;
  }

  .pending {
    stroke-dasharray: 2;
  }

  .active {
    opacity: 1;
  }

  .marker,
  .command {
    stroke: #ebebeb;
    fill: #ebebeb;
  }

  .timer {
    stroke: #fbbf24;
    fill: #fbbf24;
  }

  .signal {
    stroke: #ec4899;
    fill: #ec4899;
  }

  .activity,
  .pending {
    stroke: #a78bfa;
    fill: #a78bfa;
  }

  .child-workflow {
    stroke: #b2f8d9;
    fill: #b2f8d9;
  }

  .workflow {
    stroke: #059669;
    fill: #059669;
  }

  .Failed,
  .Terminated {
    fill: #ff4518;
    stroke: #ff4518;
  }

  .TimedOut {
    fill: #f88f49;
    stroke: #f88f49;
  }

  .Canceled {
    fill: #fff3c6;
    stroke: #fff3c6;
  }
</style>
