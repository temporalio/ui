<script lang="ts">
  import { getMillisecondDuration } from '$lib/utilities/format-time';

  import type { Step } from './deployments';
  import { TimelineConfig } from '../constants';
  import Dot from '../svg/dot.svelte';
  import Line from '../svg/line.svelte';
  import Text from '../svg/text.svelte';

  export let y = 0;
  export let startTime: Date;
  export let step: Step;
  export let canvasWidth: number;
  export let duration: number;
  export let active = true;

  const { height, gutter, radius } = TimelineConfig;

  $: timelineWidth = canvasWidth - 2 * gutter;

  $: start = new Date(step?.startTime || step.expectedStartTime);
  $: end = step?.endTime ? new Date(step.endTime) : new Date();
  $: distance = step?.startTime
    ? getMillisecondDuration({
        start: start,
        end: end,
        onlyUnderSecond: false,
      })
    : 0;

  $: length = (distance / duration) * timelineWidth;

  $: x =
    (getMillisecondDuration({
      start: startTime,
      end: start,
      onlyUnderSecond: false,
    }) /
      duration) *
      timelineWidth +
    gutter;

  const onClick = () => {
    return;
  };
</script>

<g
  role="button"
  tabindex="0"
  on:click|preventDefault={onClick}
  on:keypress|preventDefault={onClick}
  class="relative cursor-pointer"
  {height}
>
  {#if distance}
    <Line
      startPoint={[x, y]}
      endPoint={[x + length, y]}
      {active}
      strokeWidth={radius * 2}
      classification={step.status === 4 ? 'Failed' : undefined}
      pending={step.startTime && !step.endTime}
    />
  {:else}
    <Dot point={[x, y]} {active} r={radius} category="Started" />
  {/if}
  <Text point={[x, y]}>{step.target_cell}</Text>
</g>

<style lang="postcss">
  g {
    pointer-events: bounding-box;
    outline: none;
  }
</style>
