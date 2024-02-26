<script lang="ts">
  import type { EventTypeCategory } from '$lib/types/events';

  import { getEventCategoryColor, HistoryConfig } from '../constants';

  import Layer from './layer.svelte';

  export let x1: number;
  export let x2: number;
  export let y1: number;
  export let y2: number;
  export let category: EventTypeCategory | 'pending' | undefined = undefined;

  const { radius } = HistoryConfig;

  $: render = ({ context }) => {
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.fillStyle = getEventCategoryColor(category);
    context.lineWidth = radius / 2;
    context.stroke();
  };
</script>

<Layer
  {render}
  on:mouseenter
  on:mouseleave
  on:mousedown
  on:mousedown
  on:mousemove
  on:mouseup
  on:touchstart
  on:touchstart
  on:touchmove
  on:touchend
/>
