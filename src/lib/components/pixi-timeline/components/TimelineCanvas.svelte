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
</script>

<div class="relative h-full w-full overflow-hidden">
  <canvas
    bind:this={canvas}
    class="absolute inset-0 z-0 block h-full w-full cursor-grab active:cursor-grabbing"
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
