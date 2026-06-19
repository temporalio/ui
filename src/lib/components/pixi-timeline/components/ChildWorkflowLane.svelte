<script lang="ts">
  import { getContext } from 'svelte';

  import { TIMELINE_CTX, type TimelineCtx } from '../timeline-ctx.svelte';
  import type { TemporalEvent } from '../types';

  import TimelineCanvas from './TimelineCanvas.svelte';

  const _ctx = getContext<TimelineCtx>(TIMELINE_CTX);
  const closeChildWorkflow = (runId: string) => _ctx.closeChildWorkflow(runId);

  interface Props {
    runId: string;
    label: string;
    events: TemporalEvent[];
    trackIndex: number;
  }

  let { runId, label, events, trackIndex }: Props = $props();
</script>

<div
  class="bg-gray-950/95 absolute inset-x-0 z-20 overflow-hidden rounded-md border border-white/10 shadow-2xl"
  style="top: {trackIndex * 28 + 4}px; height: 180px;"
>
  <div
    class="bg-gray-900/80 flex h-7 items-center gap-2 border-b border-white/10 px-2"
  >
    <span class="text-xs font-medium text-white/60">Child:</span>
    <span class="flex-1 truncate font-mono text-xs text-white/80">{label}</span>
    <button
      class="flex h-5 w-5 items-center justify-center rounded text-white/30 hover:bg-white/10 hover:text-white"
      onclick={() => closeChildWorkflow(runId)}
      title="Close child workflow lane"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path
          d="M1 1l8 8M9 1L1 9"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linecap="round"
        />
      </svg>
    </button>
  </div>
  <div class="relative h-[calc(100%-1.75rem)]">
    <TimelineCanvas {events} />
  </div>
</div>
