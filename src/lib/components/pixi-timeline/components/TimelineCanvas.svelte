<script lang="ts">
  import { getContext, onMount } from 'svelte';

  import type { PixiRenderer } from '../renderer/PixiRenderer';
  import { TIMELINE_CTX, type TimelineCtx } from '../timeline-ctx.svelte';
  import type { PixiRenderArgs, TemporalEvent } from '../types';

  interface Props {
    /** For the main timeline: reads events from the buffer pool. */
    renderArgs?: PixiRenderArgs;
    /** For child workflow lanes: a pre-built TemporalEvent array. */
    events?: TemporalEvent[];
  }

  let { renderArgs, events }: Props = $props();

  const ctx = getContext<TimelineCtx>(TIMELINE_CTX);

  let canvas: HTMLCanvasElement;
  let renderer: PixiRenderer | null = null;
  let rendererReady = $state(false);
  let ready = $state(false);

  onMount(() => {
    let r: PixiRenderer | null = null;
    let destroyed = false;

    (async () => {
      const { PixiRenderer } = await import('../renderer/PixiRenderer');
      if (destroyed) return;
      r = new PixiRenderer(canvas, undefined, ctx);
      await r.init();
      if (destroyed) return;
      renderer = r;
      rendererReady = true;
      ready = true;
    })();

    return () => {
      destroyed = true;
      r?.destroy();
      renderer = null;
      rendererReady = false;
      ready = false;
    };
  });

  $effect(() => {
    if (!rendererReady || !renderer) return;
    if (renderArgs !== undefined) {
      renderer.loadEvents(renderArgs, {
        preserveViewport: renderArgs.poolCount > 0,
      });
    } else if (events !== undefined) {
      renderer.loadEventsLegacy(events);
    }
  });

  $effect(() => {
    if (!rendererReady || !renderer) return;
    // Wake the render loop whenever the viewport changes externally (e.g. page scroll).
    void ctx.state.viewport.scrollY;
    void ctx.state.viewport.startMs;
    void ctx.state.viewport.zoom;
    void ctx.state.viewport.scaleY;
    renderer.scheduleRender();
  });

  $effect(() => {
    if (!rendererReady || !renderer) return;
    renderer.setSortOrder(renderArgs?.sortOrder ?? 'desc');
  });
</script>

<div
  class="relative h-full w-full overflow-hidden"
  role="application"
  aria-label="Workflow event timeline"
  aria-describedby="timeline-kbd-hint"
>
  <p id="timeline-kbd-hint" class="sr-only">
    Pan left and right with arrow keys. Navigate tracks with Up and Down arrow
    keys. Select the focused event with Enter or Space. Deselect with Escape.
    Zoom with Ctrl+scroll or Shift+scroll.
  </p>
  <canvas
    bind:this={canvas}
    id="timeline-canvas"
    tabindex="0"
    aria-label="Event timeline canvas"
    class="focus-visible:outline-sky-500 absolute inset-0 z-0 block h-full w-full cursor-grab focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] active:cursor-grabbing"
    style="background:#0c0c14"
  ></canvas>

  {#if !ready}
    <div
      class="absolute inset-0 z-10 flex items-center justify-center bg-[#0c0c14]"
    >
      <div
        class="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/60"
      ></div>
    </div>
  {/if}
</div>
