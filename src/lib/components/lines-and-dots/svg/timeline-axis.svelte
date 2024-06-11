<script lang="ts">
  import { timeFormat } from '$lib/stores/time-format';
  import type { Timestamp } from '$lib/types';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import { TimelineConfig } from '../constants';

  import Line from './line.svelte';

  export let x1 = 0;
  export let x2 = 1000;
  export let timelineHeight = 1000;
  export let canvasWidth: number;
  export let startTime: string | Timestamp;
  export let endTime: string | Date;
  export let duration: number;
  export let durationToNow: number = 0;
  export let showRelative = true;

  $: timelineWidth = canvasWidth - 2 * gutter;

  const { radius, height, gutter } = TimelineConfig;
  const ticks = 20;

  $: distance = x2 - x1;
  $: tickDistance = distance / ticks;

  $: now = (durationToNow / duration) * timelineWidth + gutter;
</script>

<Line
  strokeWidth={radius / 2}
  startPoint={[x1, timelineHeight]}
  endPoint={[x1 + distance, timelineHeight]}
/>
{#each Array(ticks) as _, i}
  {@const tickX = x1 + i * tickDistance}
  {@const tickY = timelineHeight + radius * 2}
  {#if i !== 0}
    <Line
      strokeWidth={radius / 4}
      startPoint={[tickX, 0]}
      endPoint={[tickX, timelineHeight]}
      active={false}
    />
  {/if}
  {#if i === 0}
    <text
      fill="#fff"
      font-size="12"
      transform="rotate(90, {tickX}, {tickY})"
      x={tickX - radius}
      y={tickY}
    >
      <tspan>{formatDate(startTime, $timeFormat)}</tspan>
    </text>
  {:else}
    <text
      fill="#fff"
      font-size="12"
      opacity={0.5}
      transform="rotate(90, {tickX}, {height})"
      x={tickX - radius}
      y={height}
    >
      {formatDistanceAbbreviated({
        start: startTime,
        end: new Date(
          new Date(startTime.toString()).getTime() + (duration / ticks) * i,
        ),
        includeMilliseconds: duration / ticks < 1000,
      })}
    </text>
    <text
      fill="#fff"
      font-size="12"
      transform="rotate(90, {tickX}, {tickY})"
      x={tickX - radius}
      y={tickY}
    >
      {showRelative
        ? formatDistanceAbbreviated({
            start: startTime,
            end: new Date(
              new Date(startTime.toString()).getTime() + (duration / ticks) * i,
            ),
            includeMilliseconds: duration / ticks < 1000,
          })
        : formatDate(
            new Date(
              new Date(startTime.toString()).getTime() + (duration / ticks) * i,
            ),
            $timeFormat,
          )}
    </text>
  {/if}
{/each}
<text
  fill="#fff"
  font-size="12"
  transform="rotate(90, {x2}, {timelineHeight + radius * 2})"
  x={x2 - radius}
  y={timelineHeight + radius * 2 + radius / 2}
>
  <tspan>{formatDate(endTime, $timeFormat)}</tspan>
</text>
{#if durationToNow}
  <Line
    strokeWidth={radius / 4}
    startPoint={[now, 0]}
    endPoint={[now, timelineHeight]}
    pending
  />
{/if}
