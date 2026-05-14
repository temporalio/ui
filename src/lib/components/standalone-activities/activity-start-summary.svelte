<script lang="ts">
  import { timestamp } from '$lib/components/timestamp.svelte';
  import WorkflowStatusBadge from '$lib/components/workflow-status.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
  import {
    type ActivityStatus,
    toActivityStatus,
  } from '$lib/utilities/get-activity-status-and-count';

  type Props = {
    activities?: ActivityExecutionInfo[];
    loading?: boolean;
    useCurrentTimeEnd?: boolean;
    onFilter?: (activityType: string) => void;
    showControls?: boolean;
  };

  let {
    activities = [],
    loading = false,
    useCurrentTimeEnd = false,
    onFilter,
    showControls = false,
  }: Props = $props();

  type Bar = {
    key: string;
    activityType: string;
    startTime: string;
    status: ActivityStatus;
    statusLabel: string;
    left: number;
    color: string;
  };

  type Tick = {
    index: number;
    key: string;
    value: number;
    left: number;
  };

  type DragState = {
    x: number;
    start: number;
    end: number;
  };

  const defaultRangePaddingMs = 5 * 60 * 1000;
  const minimumZoomDurationMs = 60 * 1000;
  const tickCount = 5;

  let graphElement = $state<HTMLDivElement | null>(null);
  let viewStart = $state(0);
  let viewEnd = $state(0);
  let lastFullStart = $state(0);
  let lastFullEnd = $state(0);
  let dragState = $state<DragState | null>(null);
  let currentTime = $state(Date.now());

  const statusColors: Record<ActivityStatus, string> = {
    Running: '#93c5fd',
    TimedOut: '#fed7aa',
    Completed: '#bbf7d0',
    Failed: '#fecaca',
    Canceled: '#f1f5f9',
    Terminated: '#fef08a',
  };

  const getActivityStartTime = (activity: ActivityExecutionInfo): string => {
    return activity.lastStartedTime || activity.scheduleTime;
  };

  const getStartTimestamp = (activity: ActivityExecutionInfo): number => {
    return new Date(getActivityStartTime(activity)).getTime();
  };

  const toBar = (
    activity: ActivityExecutionInfo,
    start: number,
    duration: number,
  ): Bar => {
    const activityType = activity.activityType?.name || 'Unknown activity type';
    const startTime = getActivityStartTime(activity);
    const startTimestamp = getStartTimestamp(activity);
    const status = toActivityStatus(activity.status);
    const left = duration ? ((startTimestamp - start) / duration) * 100 : 50;

    return {
      key: `${activity.activityId}:${activity.runId}`,
      activityType,
      startTime,
      status,
      statusLabel: status,
      left,
      color: statusColors[status],
    };
  };

  const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  };

  const setVisibleRange = (start: number, end: number) => {
    if (!hasActivities) return;

    const unclampedDuration = Math.max(end - start, 1);
    const duration = clamp(
      unclampedDuration,
      minimumVisibleDuration,
      fullDuration,
    );
    const center = start + unclampedDuration / 2;
    let nextStart = center - duration / 2;
    let nextEnd = center + duration / 2;

    if (nextStart < fullStart) {
      nextStart = fullStart;
      nextEnd = fullStart + duration;
    }

    if (nextEnd > fullEnd) {
      nextEnd = fullEnd;
      nextStart = fullEnd - duration;
    }

    viewStart = nextStart;
    viewEnd = nextEnd;
  };

  const getGraphPercent = (clientX: number): number => {
    const rect = graphElement?.getBoundingClientRect();
    if (!rect?.width) return 0.5;
    return clamp((clientX - rect.left) / rect.width, 0, 1);
  };

  const getTimeForPercent = (percent: number): number => {
    return viewStart + viewDuration * percent;
  };

  const zoomAt = (center: number, factor: number) => {
    const nextStart = center - (center - viewStart) * factor;
    const nextEnd = center + (viewEnd - center) * factor;
    setVisibleRange(nextStart, nextEnd);
  };

  const zoomBy = (factor: number) => {
    zoomAt(viewStart + viewDuration / 2, factor);
  };

  const resetZoom = () => {
    setVisibleRange(fullStart, fullEnd);
  };

  const handleWheel = (event: WheelEvent) => {
    if (!canZoom) return;

    event.preventDefault();
    const percent = getGraphPercent(event.clientX);
    const center = getTimeForPercent(percent);
    zoomAt(center, event.deltaY < 0 ? 0.8 : 1.25);
  };

  const handlePointerDown = (event: PointerEvent) => {
    if ((event.target as HTMLElement).closest('button')) return;
    if (!canPan) return;

    (event.currentTarget as HTMLDivElement).setPointerCapture(event.pointerId);
    dragState = {
      x: event.clientX,
      start: viewStart,
      end: viewEnd,
    };
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!dragState || !graphElement) return;

    const rect = graphElement.getBoundingClientRect();
    if (!rect.width) return;

    const delta = ((event.clientX - dragState.x) / rect.width) * viewDuration;
    setVisibleRange(dragState.start - delta, dragState.end - delta);
  };

  const handlePointerEnd = () => {
    dragState = null;
  };

  const sortedActivities = $derived(
    [...activities]
      .filter((activity) => Number.isFinite(getStartTimestamp(activity)))
      .sort((a, b) => getStartTimestamp(a) - getStartTimestamp(b)),
  );

  const hasActivities = $derived(sortedActivities.length > 0);
  const rawMinStart = $derived(
    hasActivities ? getStartTimestamp(sortedActivities[0]) : 0,
  );
  const rawMaxStart = $derived(
    hasActivities
      ? getStartTimestamp(sortedActivities[sortedActivities.length - 1])
      : 0,
  );
  const rawFullEnd = $derived(
    useCurrentTimeEnd ? Math.max(rawMaxStart, currentTime) : rawMaxStart,
  );
  const fullStart = $derived(
    hasActivities && rawMinStart === rawFullEnd
      ? rawMinStart - defaultRangePaddingMs
      : rawMinStart,
  );
  const fullEnd = $derived(
    hasActivities && rawMinStart === rawFullEnd
      ? rawFullEnd + defaultRangePaddingMs
      : rawFullEnd,
  );
  const fullDuration = $derived(Math.max(fullEnd - fullStart, 1));
  const viewDuration = $derived(Math.max(viewEnd - viewStart, 1));
  const minimumVisibleDuration = $derived(
    Math.min(fullDuration, Math.max(minimumZoomDurationMs, fullDuration / 100)),
  );
  const canZoom = $derived(fullDuration > minimumVisibleDuration);
  const canPan = $derived(canZoom && viewDuration < fullDuration);
  const isFullyZoomedIn = $derived(viewDuration <= minimumVisibleDuration + 1);
  const isFullyZoomedOut = $derived(
    viewStart <= fullStart + 1 && viewEnd >= fullEnd - 1,
  );

  const bars = $derived(
    sortedActivities
      .filter((activity) => {
        const startTimestamp = getStartTimestamp(activity);
        return startTimestamp >= viewStart && startTimestamp <= viewEnd;
      })
      .map((activity) => toBar(activity, viewStart, viewDuration)),
  );

  const ticks = $derived<Tick[]>(
    hasActivities
      ? Array.from({ length: tickCount }, (_, index) => {
          const value = viewStart + (viewDuration * index) / (tickCount - 1);
          return {
            index,
            key: `${index}:${Math.round(value)}`,
            value,
            left: (index / (tickCount - 1)) * 100,
          };
        })
      : [],
  );

  $effect(() => {
    if (!hasActivities) {
      viewStart = 0;
      viewEnd = 0;
      lastFullStart = 0;
      lastFullEnd = 0;
      return;
    }

    const hasPreviousRange = lastFullStart !== 0 || lastFullEnd !== 0;
    const wasShowingFullRange =
      !hasPreviousRange ||
      (viewStart <= lastFullStart + 1 && viewEnd >= lastFullEnd - 1);

    if (wasShowingFullRange) {
      viewStart = fullStart;
      viewEnd = fullEnd;
    } else {
      setVisibleRange(viewStart, viewEnd);
    }

    lastFullStart = fullStart;
    lastFullEnd = fullEnd;
  });

  $effect(() => {
    if (!useCurrentTimeEnd) return;

    currentTime = Date.now();
    const interval = setInterval(() => {
      currentTime = Date.now();
    }, 60 * 1000);

    return () => clearInterval(interval);
  });
</script>

<div class="w-full">
  {#if showControls && hasActivities}
    <div
      class="mb-1 flex h-6 justify-end gap-1"
      aria-label="Activity timeline zoom controls"
    >
      <Tooltip top usePortal text="Zoom out">
        <button
          type="button"
          class="flex h-6 w-6 items-center justify-center rounded-sm border border-subtle bg-transparent text-secondary transition-colors hover:surface-interactive-secondary disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Zoom out"
          disabled={!canZoom || isFullyZoomedOut}
          onclick={() => zoomBy(1.25)}
        >
          <Icon name="hyphen" class="h-4 w-4" />
        </button>
      </Tooltip>
      <Tooltip top usePortal text="Zoom in">
        <button
          type="button"
          class="flex h-6 w-6 items-center justify-center rounded-sm border border-subtle bg-transparent text-secondary transition-colors hover:surface-interactive-secondary disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Zoom in"
          disabled={!canZoom || isFullyZoomedIn}
          onclick={() => zoomBy(0.8)}
        >
          <Icon name="add" class="h-4 w-4" />
        </button>
      </Tooltip>
      <Tooltip top usePortal text="Reset zoom">
        <button
          type="button"
          class="flex h-6 w-6 items-center justify-center rounded-sm border border-subtle bg-transparent text-secondary transition-colors hover:surface-interactive-secondary disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Reset zoom"
          disabled={!canZoom || isFullyZoomedOut}
          onclick={resetZoom}
        >
          <Icon name="retry" class="h-4 w-4" />
        </button>
      </Tooltip>
    </div>
  {/if}

  {#if hasActivities}
    <div
      bind:this={graphElement}
      class={dragState
        ? 'relative h-10 w-full cursor-grabbing touch-none select-none bg-subtle/40'
        : 'relative h-10 w-full cursor-grab touch-none select-none bg-subtle/40'}
      aria-label="Activity start overview. Use the mouse wheel to zoom and drag to pan."
      role="group"
      aria-busy={loading}
      onwheel={handleWheel}
      onpointerdown={handlePointerDown}
      onpointermove={handlePointerMove}
      onpointerup={handlePointerEnd}
      onpointercancel={handlePointerEnd}
      onlostpointercapture={handlePointerEnd}
    >
      {#each ticks as tick (tick.key)}
        <div
          class="pointer-events-none absolute top-0 h-full border-l border-subtle"
          style:left={`${tick.left}%`}
        >
          <span class="sr-only">{$timestamp(new Date(tick.value))}</span>
        </div>
      {/each}

      {#each bars as bar (bar.key)}
        <div
          class="absolute top-0 h-10 w-4 -translate-x-2"
          style:left={`${bar.left}%`}
        >
          <Tooltip top usePortal class="h-full w-full">
            <svelte:fragment slot="content">
              <div class="flex flex-col gap-1 text-left">
                <div class="flex items-center gap-2">
                  <span>{bar.activityType}</span>
                  <WorkflowStatusBadge status={bar.status} />
                </div>
                <span class="text-slate-300">{$timestamp(bar.startTime)}</span>
              </div>
            </svelte:fragment>
            <button
              class="activity-start-bar relative h-full w-full cursor-pointer appearance-none border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style:--bar-color={bar.color}
              aria-label={`Filter by activity type ${bar.activityType}`}
              onclick={() => onFilter?.(bar.activityType)}
            >
              <span class="sr-only">
                {bar.activityType} - {bar.statusLabel} - {$timestamp(
                  bar.startTime,
                )}
              </span>
            </button>
          </Tooltip>
        </div>
      {/each}
    </div>
  {:else}
    <div
      class="flex h-10 w-full items-center justify-center bg-subtle/40 text-xs text-secondary"
      aria-live="polite"
    ></div>
  {/if}

  <div class="relative mt-1 h-4 text-xs text-secondary">
    {#if hasActivities}
      {#each ticks as tick (tick.key)}
        {#if tick.index === 0}
          <span class="absolute left-0 whitespace-nowrap">
            {$timestamp(new Date(tick.value))}
          </span>
        {:else if tick.index === ticks.length - 1}
          <span class="absolute right-0 whitespace-nowrap text-right">
            {$timestamp(new Date(tick.value))}
          </span>
        {:else}
          <span
            class="absolute hidden -translate-x-1/2 whitespace-nowrap md:block"
            style:left={`${tick.left}%`}
          >
            {$timestamp(new Date(tick.value))}
          </span>
        {/if}
      {/each}
    {/if}
  </div>
</div>

<style lang="postcss">
  .activity-start-bar::before {
    @apply absolute left-1/2 top-1/2 block h-8 w-0.5 -translate-x-1/2 -translate-y-1/2 content-[''];

    background-color: var(--bar-color);
  }

  .activity-start-bar:hover::before,
  .activity-start-bar:focus-visible::before {
    @apply h-10 w-1;
  }
</style>
