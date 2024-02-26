<script lang="ts">
  // import { timeFormat } from '$lib/stores/time-format';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type {
    EventClassification,
    EventTypeCategory,
    PendingActivity,
    WorkflowEvent,
  } from '$lib/types/events';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import { isPendingActivity } from '$lib/utilities/is-pending-activity';
  // import { formatDate } from '$lib/utilities/format-date';

  export let y: number = 20;
  export let category: EventTypeCategory | 'pending';
  export let classification: EventClassification | undefined = undefined;

  export let event: WorkflowEvent | PendingActivity;
  export let group: EventGroup;

  export let startingX: number;
  export let nextDistance = 0;
  export let offset = 1;
  export let connectLine = false;
  export let active = false;
  export let onClick: (x: WorkflowEvent | PendingActivity) => void;
  export let index: number;

  const r = 6;
  const strokeWidth = r / 2;
  $: horizontalOffset = category === 'workflow' ? 0 : (offset / 1.5) * 3 * r;
  $: nextIsPending =
    group?.lastEvent.id === event?.id && group?.pendingActivity;
</script>

<g
  on:click={() => onClick(event)}
  on:keypress={() => onClick(event)}
  class="relative cursor-pointer"
>
  {#if index % 2 === 1}
    <rect
      x={0}
      y={y - 12}
      width={startingX - strokeWidth}
      height={24}
      fill="#444F64"
    />
  {/if}
  {#if isPendingActivity(event)}
    <text class="text" class:active x={5} y={y + 5}
      ><tspan x={50}>Pending Activity - Attempt {event.attempt}</tspan></text
    >
  {:else}
    <text class="text" class:active x={5} y={y + 5}
      ><tspan>{event.id}</tspan><tspan x={50}
        >{spaceBetweenCapitalLetters(event?.name)}</tspan
      ></text
    >
    <!-- <text class="timestamp hidden lg:block" class:active x={5} y={y + 15}
      >{event?.timestamp
        ? formatDate(new Date(event.timestamp), $timeFormat)
        : ''}</text
    > -->
  {/if}
  {#if category !== 'workflow' && connectLine}
    <line
      class="line {category}"
      class:active
      stroke-width={strokeWidth}
      x1={startingX}
      x2={startingX + horizontalOffset - r}
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
        from="0 {startingX + horizontalOffset} {y}"
        to="360 {startingX + horizontalOffset} {y}"
        dur="2s"
        repeatCount="indefinite"
      />
    {/if}
    <circle
      class="dot {category} {classification}"
      class:active
      stroke-width={strokeWidth}
      cx={startingX + horizontalOffset}
      cy={y}
      {r}
    />
  </g>
  {#if nextDistance}
    <line
      class="line {category}"
      class:active
      stroke-width={strokeWidth}
      stroke-dasharray={nextIsPending ? '3' : 'none'}
      x1={startingX + horizontalOffset + r / 2 - strokeWidth}
      x2={startingX + horizontalOffset + r / 2 - strokeWidth}
      y1={y + r + strokeWidth / 2}
      y2={y + nextDistance - r}
    />
  {/if}
</g>

<style lang="postcss">
  g {
    outline: none;
  }

  .line,
  .dot,
  .text,
  .timestamp {
    cursor: pointer;
    opacity: 0.25;
    outline: none;
  }

  .dot {
    opacity: 0.5;
    fill: #2d323e;
  }

  .active {
    opacity: 1;
  }

  text {
    fill: white;
    font-size: 16px;
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

  .activity {
    stroke: #a78bfa;
    fill: #a78bfa;
  }

  .pending {
    stroke: #a78bfa;
    stroke-dasharray: 1;
    fill: none;
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

  .timestamp {
    stroke: white;
    font-size: 12px;
  }
</style>
