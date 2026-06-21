<script lang="ts">
  import { setContext } from 'svelte';

  import type { PixiRenderArgs } from './types';

  import ChildWorkflowLane from './components/ChildWorkflowLane.svelte';
  import EventInlinePanel from './components/EventInlinePanel.svelte';
  import EventTooltip from './components/EventTooltip.svelte';
  import TimelineCanvas from './components/TimelineCanvas.svelte';
  import TimelineControls from './components/TimelineControls.svelte';
  import TimelineScrollbarX from './components/TimelineScrollbarX.svelte';
  import {
    makeMainCtx,
    TIMELINE_CTX,
    timelineState,
  } from './timeline-ctx.svelte';

  interface Props {
    renderArgs: PixiRenderArgs;
    class?: string;
  }

  let { renderArgs, class: className = '' }: Props = $props();

  setContext(TIMELINE_CTX, makeMainCtx());
</script>

<div class="flex h-full w-full flex-col {className}">
  <TimelineControls />

  <div class="relative min-h-0 flex-1 overflow-hidden">
    <TimelineCanvas {renderArgs} />

    {#if timelineState.hovered}
      <EventTooltip
        event={timelineState.hovered}
        x={timelineState.hoveredPosition.x}
        barTop={timelineState.hoveredPosition.y}
        barBottom={timelineState.hoveredPosition.barBottom}
        containerHeight={timelineState.maxScrollY}
      />
    {/if}

    {#each Object.values(timelineState.selectedEvents).sort((a, b) => a.trackIndex - b.trackIndex) as event (event.eventId)}
      <EventInlinePanel {event} />
    {/each}

    {#each timelineState.openedChildWorkflows as cw (cw.runId)}
      <ChildWorkflowLane
        runId={cw.runId}
        label={cw.label}
        events={cw.events}
        trackIndex={cw.trackIndex}
      />
    {/each}
  </div>

  <TimelineScrollbarX />
</div>
