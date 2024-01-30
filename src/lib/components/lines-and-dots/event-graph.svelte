<script lang="ts">
  import type { WorkflowEvents } from '$lib/types/events';

  import LineDot from './line-dot.svelte';
  import Line from './line.svelte';

  export let history: WorkflowEvents;

  export let canvasX = 100;
  export let gap = 38.25;
  const canvasY = gap * history.length;
</script>

<div class="w-[{canvasX}px]">
  <svg viewBox="0 0 {canvasX} {canvasY}">
    <Line {canvasX} start={0} end={canvasY} />
    {#each history as event, index (event.id)}
      <LineDot y={index * gap + gap / 2} category={event.category} {canvasX} />
    {/each}
  </svg>
</div>
