<script lang="ts">
  import { timestamp } from '$lib/components/timestamp.svelte';
  import WorkflowStatusBadge from '$lib/components/workflow-status.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import type { WorkflowExecution, WorkflowStatus } from '$lib/types/workflows';

  type Props = {
    workflows?: WorkflowExecution[];
    loading?: boolean;
    onFilter?: (workflowType: string) => void;
  };

  let { workflows = [], loading = false, onFilter }: Props = $props();

  type Bar = {
    key: string;
    workflowType: string;
    startTime: string;
    status: WorkflowStatus;
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

  type StatusColorKey = Exclude<WorkflowStatus, null>;

  const defaultRangePaddingMs = 5 * 60 * 1000;
  const minimumZoomDurationMs = 60 * 1000;
  const tickCount = 5;

  let graphElement = $state<HTMLDivElement | null>(null);
  let viewStart = $state(0);
  let viewEnd = $state(0);
  let lastFullStart = $state(0);
  let lastFullEnd = $state(0);
  let dragState = $state<DragState | null>(null);

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

  const getStartTimestamp = (workflow: WorkflowExecution): number => {
    return new Date(workflow.startTime).getTime();
  };

  const getStatusColor = (status: WorkflowStatus): string => {
    return status ? (statusColors[status] ?? '#cbd5e1') : '#cbd5e1';
  };

  const toBar = (
    workflow: WorkflowExecution,
    start: number,
    duration: number,
  ): Bar => {
    const workflowType = workflow.name || 'Unknown workflow type';
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
    };
  };

  const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
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

  const sortedWorkflows = $derived(
    [...workflows]
      .filter((workflow) => Number.isFinite(getStartTimestamp(workflow)))
      .sort((a, b) => getStartTimestamp(a) - getStartTimestamp(b)),
  );

  const hasWorkflows = $derived(sortedWorkflows.length > 0);
  const showControls = $derived(hasWorkflows);
  const rawMinStart = $derived(
    hasWorkflows ? getStartTimestamp(sortedWorkflows[0]) : 0,
  );
  const rawMaxStart = $derived(
    hasWorkflows
      ? getStartTimestamp(sortedWorkflows[sortedWorkflows.length - 1])
      : 0,
  );
  const fullStart = $derived(
    hasWorkflows && rawMinStart === rawMaxStart
      ? rawMinStart - defaultRangePaddingMs
      : rawMinStart,
  );
  const fullEnd = $derived(
    hasWorkflows && rawMinStart === rawMaxStart
      ? rawMaxStart + defaultRangePaddingMs
      : rawMaxStart,
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
    sortedWorkflows
      .filter((workflow) => {
        const startTimestamp = getStartTimestamp(workflow);
        return startTimestamp >= viewStart && startTimestamp <= viewEnd;
      })
      .map((workflow) => toBar(workflow, viewStart, viewDuration)),
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
</script>

<div class="w-full">
  <div
    class="mb-1 flex h-6 justify-end gap-1"
    aria-label="Workflow timeline zoom controls"
  >
    {#if showControls}
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
    {/if}
  </div>

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
              </div>
            </svelte:fragment>
            <button
              class="workflow-start-bar relative h-full w-full cursor-pointer appearance-none border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              style:--bar-color={bar.color}
              aria-label={`Filter by workflow type ${bar.workflowType}`}
              onclick={() => onFilter?.(bar.workflowType)}
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
</style>
