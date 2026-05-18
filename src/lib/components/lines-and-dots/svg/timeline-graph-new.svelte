<script lang="ts">
  import { Viewport } from '../utils/timeline/viewport.svelte';
  interface Props {
    viewportHeight?: number;
    startTimeMs: number;
    endTimeMs: number;
  }
  const { viewportHeight = 0, startTimeMs, endTimeMs }: Props = $props();

  const viewport = new Viewport({
    startTimeMs: 0,
    endTimeMs: 0,
    widthPx: 0,
    heightPx: 0,
  });

  let canvasWidthPx = $state(0);
  $effect(() => viewport.setSize(canvasWidthPx, viewportHeight));
  $effect(() => viewport.setTimespan(startTimeMs, endTimeMs));
</script>

<div bind:clientWidth={canvasWidthPx}></div>
