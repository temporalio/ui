<script lang="ts">
  import { timestamp } from '$lib/components/timestamp.svelte';
  import WorkflowStatusBadge from '$lib/components/workflow-status.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import type { WorkflowExecution, WorkflowStatus } from '$lib/types/workflows';

  type Props = {
    workflows?: WorkflowExecution[];
    loading?: boolean;
    rangeStartTime?: number | null;
    rangeEndTime?: number | null;
    useCurrentTimeEnd?: boolean;
    onTimeRangeFilter?: (range: TimeRange) => void;
    showControls?: boolean;
  };

  let {
    workflows = [],
    loading = false,
    rangeStartTime = null,
    rangeEndTime = null,
    useCurrentTimeEnd = false,
    onTimeRangeFilter,
    showControls = false,
  }: Props = $props();

  type TimeRange = {
    start: number;
    end: number;
  };

  type Bar = {
    key: string;
    workflowType: string;
    startTime: string;
    status: WorkflowStatus;
    statusLabel: string;
    left: number;
    color: string;
    rangeStart: number;
    rangeEnd: number;
  };

  type StatusSegment = {
    key: string;
    status: WorkflowStatus;
    statusLabel: string;
    count: number;
    percent: number;
    color: string;
  };

  type WorkflowTypeCount = {
    name: string;
    count: number;
  };

  type DensityBucket = {
    key: string;
    workflows: WorkflowExecution[];
    count: number;
    start: number;
    end: number;
    left: number;
    width: number;
    height: number;
    opacity: number;
    glow: number;
    columnWidth: number;
    peakCount: number;
    statusSegments: StatusSegment[];
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

  type StatusColorKey = Exclude<WorkflowStatus, null>;

  const defaultRangePaddingMs = 5 * 60 * 1000;
  const minimumZoomDurationMs = 60 * 1000;
  const fallbackGraphWidthPx = 800;
  const minimumDensityBucketWidthPx = 14;
  const tickCount = 5;
  const secondMs = 1000;
  const minuteMs = 60 * secondMs;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;
  const bucketIntervalsMs = [
    secondMs,
    5 * secondMs,
    15 * secondMs,
    30 * secondMs,
    minuteMs,
    5 * minuteMs,
    15 * minuteMs,
    30 * minuteMs,
    hourMs,
    3 * hourMs,
    6 * hourMs,
    12 * hourMs,
    dayMs,
    2 * dayMs,
    7 * dayMs,
    14 * dayMs,
    30 * dayMs,
    90 * dayMs,
    180 * dayMs,
    365 * dayMs,
  ];

  let graphElement = $state<HTMLDivElement | null>(null);
  let graphWidth = $state(0);
  let viewStart = $state(0);
  let viewEnd = $state(0);
  let lastFullStart = $state(0);
  let lastFullEnd = $state(0);
  let dragState = $state<DragState | null>(null);
  let currentTime = $state(Date.now());

  const statusColors: Partial<Record<StatusColorKey, string>> = {
    Running: '#93c5fd',
    TimedOut: '#fed7aa',
    Completed: '#bbf7d0',
    Failed: '#fecaca',
    ContinuedAsNew: '#e9d5ff',
    Canceled: '#f1f5f9',
    Terminated: '#fef08a',
    Paused: '#fef08a',
  };

  const densityStatusColors: Partial<Record<StatusColorKey, string>> = {
    Running: '#3b82f6',
    TimedOut: '#f97316',
    Completed: '#22c55e',
    Failed: '#ef4444',
    ContinuedAsNew: '#a855f7',
    Canceled: '#64748b',
    Terminated: '#eab308',
    Paused: '#ca8a04',
  };

  const statusOrder: StatusColorKey[] = [
    'Running',
    'TimedOut',
    'Completed',
    'Failed',
    'ContinuedAsNew',
    'Canceled',
    'Terminated',
    'Paused',
  ];

  const getStartTimestamp = (workflow: WorkflowExecution): number => {
    return new Date(workflow.startTime).getTime();
  };

  const getStatusColor = (status: WorkflowStatus): string => {
    return status ? (statusColors[status] ?? '#cbd5e1') : '#cbd5e1';
  };

  const getDensityStatusColor = (status: WorkflowStatus): string => {
    return status ? (densityStatusColors[status] ?? '#94a3b8') : '#94a3b8';
  };

  const getWorkflowType = (workflow: WorkflowExecution): string => {
    return workflow.name || 'Unknown workflow type';
  };

  const toBar = (
    workflow: WorkflowExecution,
    start: number,
    duration: number,
    rangeStart: number,
    rangeEnd: number,
  ): Bar => {
    const workflowType = getWorkflowType(workflow);
    const startTimestamp = getStartTimestamp(workflow);
    const left = duration ? ((startTimestamp - start) / duration) * 100 : 50;

    return {
      key: `${workflow.id}:${workflow.runId}`,
      workflowType,
      startTime: workflow.startTime,
      status: workflow.status,
      statusLabel: workflow.status ?? 'Unknown',
      left,
      color: getStatusColor(workflow.status),
      rangeStart,
      rangeEnd,
    };
  };

  const toStatusLabel = (status: WorkflowStatus): string => {
    return status ?? 'Unknown';
  };

  const getStatusRank = (status: WorkflowStatus): number => {
    return status ? statusOrder.indexOf(status) : statusOrder.length;
  };

  const countByStatus = (workflows: WorkflowExecution[]) => {
    const counts = new Map<WorkflowStatus, number>();

    workflows.forEach((workflow) => {
      counts.set(workflow.status, (counts.get(workflow.status) ?? 0) + 1);
    });

    return counts;
  };

  const countByWorkflowType = (
    workflows: WorkflowExecution[],
  ): WorkflowTypeCount[] => {
    const counts = new Map<string, number>();

    workflows.forEach((workflow) => {
      const workflowType = getWorkflowType(workflow);
      counts.set(workflowType, (counts.get(workflowType) ?? 0) + 1);
    });

    return Array.from(counts, ([name, count]) => ({ name, count })).sort(
      (a, b) => b.count - a.count,
    );
  };

  const toStatusSegments = (
    workflows: WorkflowExecution[],
  ): StatusSegment[] => {
    const total = workflows.length;

    return Array.from(
      countByStatus(workflows),
      ([status, count]): StatusSegment => ({
        key: toStatusLabel(status),
        status,
        statusLabel: toStatusLabel(status),
        count,
        percent: total ? (count / total) * 100 : 0,
        color: getDensityStatusColor(status),
      }),
    ).sort((a, b) => getStatusRank(a.status) - getStatusRank(b.status));
  };

  const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  };

  const getBucketInterval = (duration: number, maxBuckets: number): number => {
    const targetInterval = duration / Math.max(maxBuckets, 1);
    return (
      bucketIntervalsMs.find((interval) => interval >= targetInterval) ??
      Math.ceil(targetInterval)
    );
  };

  const setVisibleRange = (start: number, end: number) => {
    if (!hasWorkflows) return;

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

  const applyTimeRangeFilter = (start: number, end: number) => {
    if (onTimeRangeFilter) {
      onTimeRangeFilter({ start, end });
      return;
    }

    setVisibleRange(start, end);
  };

  const handleBucketClick = (bucket: DensityBucket) => {
    applyTimeRangeFilter(bucket.start, bucket.end);
  };

  const sortedWorkflows = $derived(
    [...workflows]
      .filter((workflow) => Number.isFinite(getStartTimestamp(workflow)))
      .sort((a, b) => getStartTimestamp(a) - getStartTimestamp(b)),
  );

  const hasWorkflows = $derived(sortedWorkflows.length > 0);
  const rawMinStart = $derived(
    hasWorkflows ? getStartTimestamp(sortedWorkflows[0]) : 0,
  );
  const rawMaxStart = $derived(
    hasWorkflows
      ? getStartTimestamp(sortedWorkflows[sortedWorkflows.length - 1])
      : 0,
  );
  const rawFullStart = $derived(
    typeof rangeStartTime === 'number' && Number.isFinite(rangeStartTime)
      ? rangeStartTime
      : rawMinStart,
  );
  const rawFullEnd = $derived(
    Math.max(
      typeof rangeEndTime === 'number' && Number.isFinite(rangeEndTime)
        ? rangeEndTime
        : useCurrentTimeEnd
          ? Math.max(rawMaxStart, currentTime)
          : rawMaxStart,
      rawFullStart,
    ),
  );
  const fullStart = $derived(
    hasWorkflows && rawFullStart === rawFullEnd
      ? rawFullStart - defaultRangePaddingMs
      : rawFullStart,
  );
  const fullEnd = $derived(
    hasWorkflows && rawFullStart === rawFullEnd
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

  const visibleWorkflows = $derived(
    sortedWorkflows.filter((workflow) => {
      const startTimestamp = getStartTimestamp(workflow);
      return startTimestamp >= viewStart && startTimestamp <= viewEnd;
    }),
  );
  const maxBucketCount = $derived(
    Math.max(
      1,
      Math.floor(
        (graphWidth || fallbackGraphWidthPx) / minimumDensityBucketWidthPx,
      ),
    ),
  );
  const bucketInterval = $derived(
    getBucketInterval(viewDuration, maxBucketCount),
  );
  const densityBuckets = $derived<DensityBucket[]>(
    (() => {
      const buckets = new Map<number, WorkflowExecution[]>();

      visibleWorkflows.forEach((workflow) => {
        const startTimestamp = getStartTimestamp(workflow);
        const index = Math.floor(startTimestamp / bucketInterval);
        const bucket = buckets.get(index) ?? [];
        bucket.push(workflow);
        buckets.set(index, bucket);
      });

      const maxFilledBucketCount = Math.max(
        1,
        ...Array.from(buckets.values(), (bucket) => bucket.length),
      );
      const maxLogCount = Math.log1p(maxFilledBucketCount);

      return Array.from(buckets, ([index, bucket]) => {
        const bucketStart = Math.max(index * bucketInterval, viewStart);
        const bucketEnd = Math.min((index + 1) * bucketInterval, viewEnd);
        const normalized =
          maxLogCount > 0 ? Math.log1p(bucket.length) / maxLogCount : 1;

        return {
          key: `${index}:${bucket.length}:${bucketInterval}`,
          workflows: bucket,
          count: bucket.length,
          start: bucketStart,
          end: bucketEnd,
          left: ((bucketStart - viewStart) / viewDuration) * 100,
          width: ((bucketEnd - bucketStart) / viewDuration) * 100,
          height: 22 + normalized * 78,
          opacity: 0.78 + normalized * 0.22,
          glow: normalized * 4,
          columnWidth: 4 + normalized * 12,
          peakCount: maxFilledBucketCount,
          statusSegments: toStatusSegments(bucket),
        };
      })
        .filter((bucket) => bucket.end > bucket.start)
        .sort((a, b) => a.start - b.start);
    })(),
  );
  const bars = $derived(
    densityBuckets
      .filter((bucket) => bucket.count === 1)
      .map((bucket) =>
        toBar(
          bucket.workflows[0],
          viewStart,
          viewDuration,
          bucket.start,
          bucket.end,
        ),
      ),
  );
  const aggregateBuckets = $derived(
    densityBuckets.filter((bucket) => bucket.count > 1),
  );

  const ticks = $derived<Tick[]>(
    hasWorkflows
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
    if (!hasWorkflows) {
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

  $effect(() => {
    if (!graphElement) return;

    const updateGraphWidth = () => {
      graphWidth = graphElement?.getBoundingClientRect().width ?? 0;
    };
    const observer = new ResizeObserver(updateGraphWidth);
    observer.observe(graphElement);
    updateGraphWidth();

    return () => observer.disconnect();
  });
</script>

<div class="w-full">
  {#if showControls && hasWorkflows}
    <div
      class="mb-1 flex h-6 justify-end gap-1"
      aria-label="Workflow timeline zoom controls"
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

  {#if hasWorkflows}
    <div
      bind:this={graphElement}
      class={dragState
        ? 'relative h-10 w-full cursor-grabbing touch-none select-none bg-subtle/40'
        : 'relative h-10 w-full cursor-grab touch-none select-none bg-subtle/40'}
      aria-label="Workflow start overview. Use the mouse wheel to zoom and drag to pan."
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

      {#each aggregateBuckets as bucket (bucket.key)}
        <div
          class="absolute top-0 h-10"
          style:left={`${bucket.left}%`}
          style:width={`${bucket.width}%`}
        >
          <Tooltip top usePortal class="h-full w-full">
            <svelte:fragment slot="content">
              <div class="flex min-w-56 flex-col gap-2 text-left">
                <div>
                  <div class="font-medium">
                    {bucket.count.toLocaleString()}
                    loaded {bucket.count === 1 ? 'workflow' : 'workflows'} started
                  </div>
                  <div class="text-slate-300">
                    {$timestamp(new Date(bucket.start))} - {$timestamp(
                      new Date(bucket.end),
                    )}
                  </div>
                </div>
                <div class="flex flex-col gap-1">
                  {#each bucket.statusSegments as segment (segment.key)}
                    <div class="flex items-center justify-between gap-3">
                      {#if segment.status}
                        <WorkflowStatusBadge status={segment.status} />
                      {:else}
                        <span class="text-slate-300">
                          {segment.statusLabel}
                        </span>
                      {/if}
                      <span class="text-slate-300">
                        {segment.count.toLocaleString()}
                      </span>
                    </div>
                  {/each}
                </div>
              </div>
            </svelte:fragment>
            <button
              class="workflow-density-bucket relative h-full w-full cursor-pointer appearance-none border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style:--bucket-height={`${bucket.height}%`}
              style:--bucket-opacity={bucket.opacity}
              style:--bucket-glow={`${bucket.glow}px`}
              style:--bucket-width={`${bucket.columnWidth}px`}
              aria-label={`${bucket.count.toLocaleString()} loaded workflows started between ${$timestamp(
                new Date(bucket.start),
              )} and ${$timestamp(new Date(bucket.end))}`}
              onclick={() => handleBucketClick(bucket)}
            >
              <span class="workflow-density-column" aria-hidden="true">
                {#each bucket.statusSegments as segment (segment.key)}
                  <span
                    class="block w-full"
                    style:height={`${segment.percent}%`}
                    style:background-color={segment.color}
                  ></span>
                {/each}
              </span>
            </button>
          </Tooltip>
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
                  <span>{bar.workflowType}</span>
                  {#if bar.status}
                    <WorkflowStatusBadge status={bar.status} />
                  {:else}
                    <span class="text-slate-300">{bar.statusLabel}</span>
                  {/if}
                </div>
                <span class="text-slate-300">{$timestamp(bar.startTime)}</span>
                <span class="text-slate-300">
                  Range: {$timestamp(new Date(bar.rangeStart))} - {$timestamp(
                    new Date(bar.rangeEnd),
                  )}
                </span>
              </div>
            </svelte:fragment>
            <button
              class="workflow-start-bar relative h-full w-full cursor-pointer appearance-none border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style:--bar-color={bar.color}
              aria-label={`Filter workflows started between ${$timestamp(
                new Date(bar.rangeStart),
              )} and ${$timestamp(new Date(bar.rangeEnd))}`}
              onclick={() => applyTimeRangeFilter(bar.rangeStart, bar.rangeEnd)}
            >
              <span class="sr-only">
                {bar.workflowType} - {bar.statusLabel} - {$timestamp(
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
    {#if hasWorkflows}
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
  .workflow-start-bar::before {
    @apply absolute left-1/2 top-1/2 block h-8 w-0.5 -translate-x-1/2 -translate-y-1/2 content-[''];

    background-color: var(--bar-color);
  }

  .workflow-start-bar:hover::before,
  .workflow-start-bar:focus-visible::before {
    @apply h-10 w-1;
  }

  .workflow-density-column {
    @apply absolute bottom-1 left-1/2 flex min-h-2 -translate-x-1/2 flex-col-reverse overflow-hidden rounded-sm transition-all;

    width: var(--bucket-width);
    height: min(var(--bucket-height), calc(100% - 0.5rem));
    min-width: 3px;
    opacity: var(--bucket-opacity);
    box-shadow: 0 0 var(--bucket-glow) rgb(15 23 42 / 45%);
  }

  .workflow-density-bucket:hover .workflow-density-column,
  .workflow-density-bucket:focus-visible .workflow-density-column {
    height: var(--bucket-height);
    opacity: 1;
    width: calc(var(--bucket-width) + 2px);
  }
</style>
