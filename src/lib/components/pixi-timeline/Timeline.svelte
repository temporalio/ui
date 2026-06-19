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
    setViewport,
    TIMELINE_CTX,
    timelineState,
  } from './timeline-ctx.svelte';

  interface Props {
    renderArgs: PixiRenderArgs;
    class?: string;
  }

  let { renderArgs, class: className = '' }: Props = $props();

  setContext(TIMELINE_CTX, makeMainCtx());

  let trackAreaHeight = $state(0);
  let trackAreaWidth = $state(0);
  let scrollEl: HTMLDivElement;

  // Spacer height that gives the native scrollbar the correct range.
  // When scrollTop reaches maxScrollY the last track is at the bottom of the canvas.
  const spacerH = $derived(timelineState.maxScrollY);

  // Keep the DOM scrollTop in sync when drag/zoom changes viewport.scrollY.
  let lastScrollY = 0;
  $effect(() => {
    const scrollY = timelineState.viewport.scrollY;
    if (scrollEl && Math.abs(scrollEl.scrollTop - scrollY) > 1) {
      lastScrollY = scrollY;
      scrollEl.scrollTop = scrollY;
    }
  });

  function handleScroll() {
    const scrollY = scrollEl.scrollTop;
    if (Math.abs(scrollY - lastScrollY) > 0) {
      lastScrollY = scrollY;
      setViewport({ scrollY });
    }
  }
</script>

<div class="flex h-full w-full flex-col {className}">
  <TimelineControls />

  <div class="flex min-h-0 flex-1 overflow-hidden">
    <!--
      Native scroll container. The canvas + overlays sit in a sticky wrapper
      that stays pinned to the top; the spacer below extends the scroll range.
    -->
    <div
      bind:this={scrollEl}
      bind:clientHeight={trackAreaHeight}
      bind:clientWidth={trackAreaWidth}
      class="relative min-h-0 flex-1 overflow-y-scroll"
      onscroll={handleScroll}
    >
      <!-- Sticky viewport: canvas + all overlays stay fixed to the top -->
      <div
        class="sticky top-0 isolate overflow-hidden"
        style="height: {trackAreaHeight}px;"
      >
        <TimelineCanvas {renderArgs} />

        {#if timelineState.hovered}
          <EventTooltip
            event={timelineState.hovered}
            x={timelineState.hoveredPosition.x}
            barTop={timelineState.hoveredPosition.y}
            barBottom={timelineState.hoveredPosition.barBottom}
            containerHeight={trackAreaHeight}
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
      <!-- Spacer: extends native scroll range to maxScrollY -->
      <div class="pointer-events-none" style="height: {spacerH}px;"></div>
    </div>
  </div>

  <TimelineScrollbarX />
</div>
