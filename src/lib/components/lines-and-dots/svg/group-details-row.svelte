<script lang="ts">
  import type { EventGroup } from '$lib/models/event-groups/event-groups';

  import { TimelineConfig } from '../constants';

  import Box from './box.svelte';
  import Text from './text.svelte';

  export let group: EventGroup;
  export let index: number;
  export let canvasWidth: number;
  export let onClick: () => void;

  const { gap, gutter } = TimelineConfig;

  $: y = (index + 1) * gap;

  $: timelineWidth = canvasWidth - 2 * gutter;
</script>

<g
  role="button"
  tabindex="0"
  on:click|preventDefault={onClick}
  on:keypress={onClick}
  class="relative cursor-pointer"
  height={gap * 2}
>
  <Box
    point={[gutter, y + gap / 2]}
    width={timelineWidth}
    height={gap * 2}
    fill="#ffffff"
  />
  <Text point={[gutter, y + gap]} category="icon">{JSON.stringify(group)}</Text>
</g>

<style lang="postcss">
  g {
    pointer-events: bounding-box;
    outline: none;
  }
</style>
