<svelte:options runes />

<script lang="ts">
  import { onMount } from 'svelte';

  import { beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/state';

  import EventHistoryLegend from '$lib/components/lines-and-dots/event-history-legend.svelte';
  import EventTypeFilter from '$lib/components/lines-and-dots/event-type-filter.svelte';
  import TimelineGraph from '$lib/components/lines-and-dots/svg/timeline-graph.svelte';
  import WorkflowError from '$lib/components/lines-and-dots/workflow-error.svelte';
  import DownloadEventHistoryModal from '$lib/components/workflow/download-event-history-modal.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import WorkflowCallbacks from '$lib/components/workflow/workflow-callbacks.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { toEvent } from '$lib/models/event-history';
  import type {
    BidirectionalProgress,
    BidirectionalStats,
  } from '$lib/services/fetch-bidirectional';
  import { fetchBidirectional } from '$lib/services/fetch-bidirectional';
  import {
    enrichGroups,
    getWorkflowTaskFailedEvent as getBufferWftFailedEvent,
    getGroupArray,
    processEvent,
    reset as resetBuffer,
  } from '$lib/services/grouped-event-buffer';
  import { clearActives } from '$lib/stores/active-events';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { currentEventHistory, fullEventHistory } from '$lib/stores/events';
  import { eventTypeFilter } from '$lib/stores/filters';
  import { workflowActionsReady } from '$lib/stores/workflow-actions-ready';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type {
    WorkflowTaskFailedEvent,
    WorkflowTaskTimedOutEvent,
  } from '$lib/types/events';
  import {
    parseEventFilterParams,
    updateEventFilterParams,
  } from '$lib/utilities/event-filter-params';
  import { orderGroupsByPending } from '$lib/utilities/order-groups-by-pending';

  interface Props {
    stats?: BidirectionalStats | null;
    progress?: BidirectionalProgress | null;
  }

  let {
    stats = $bindable<BidirectionalStats | null>(null),
    progress = $bindable<BidirectionalProgress | null>(null),
  }: Props = $props();

  const { namespace, workflow: workflowId, run: runId } = $derived(page.params);

  let error = $state<string | null>(null);
  let fetchComplete = $state(false);
  let barPhase = $state<'fetching' | 'rendering' | 'done'>('fetching');
  let controller: AbortController;
  let bufferGroups = $state<EventGroup[]>([]);

  let t0 = 0;
  let loadMs = $state<number | null>(null);
  let firstRenderMs = $state<number | null>(null);
  let allRenderMs = $state<number | null>(null);

  function start() {
    t0 = performance.now();
    progress = null;
    stats = null;
    error = null;
    loadMs = null;
    firstRenderMs = null;
    allRenderMs = null;
    fetchComplete = false;
    barPhase = 'fetching';
    frozenMeetCol = COLS / 2;
    bufferGroups = [];
    controller?.abort();
    controller = new AbortController();

    const estimatedSize =
      parseInt($workflowRun.workflow?.historyEvents ?? '0') || 0;
    resetBuffer(estimatedSize);

    let ascFirstDone = false;

    fetchBidirectional({
      namespace,
      workflowId,
      runId,
      signal: controller.signal,
      maximumPageSize: 1000,
      onProgress: (p) => {
        progress = p;
      },
      onFirstDescPage: (descFirst) => {
        if (!descFirst.length) return;
        const processed = descFirst
          .map((e) => toEvent(e))
          .filter(Boolean) as import('$lib/types/events').WorkflowEvent[];
        fullEventHistory.update((curr) =>
          curr.length ? [...curr, ...processed] : processed,
        );
        currentEventHistory.set(processed);
        if (reverseSort) workflowActionsReady.set(true);
        // Show both bookends: first asc groups + first desc groups together.
        bufferGroups = getGroupArray();
      },
      onRawPage: (events, isAscending) => {
        for (const event of events) processEvent(event, isAscending);

        if (isAscending && !ascFirstDone) {
          ascFirstDone = true;
          const processed = events
            .map((e) => toEvent(e))
            .filter(Boolean) as import('$lib/types/events').WorkflowEvent[];
          fullEventHistory.update((curr) =>
            curr.length ? [...processed, ...curr] : processed,
          );
          if (!reverseSort) {
            currentEventHistory.set(processed);
            workflowActionsReady.set(true);
          }
          // Show the left bookend immediately.
          bufferGroups = getGroupArray();
        }
      },
    })
      .then(async (s) => {
        stats = s;
        loadMs = performance.now() - t0;

        const asc = Math.floor(
          (s.ascPages / (s.ascPages + s.descPages)) * COLS,
        );
        const desc = Math.floor(
          (s.descPages / (s.ascPages + s.descPages)) * COLS,
        );
        frozenMeetCol = Math.floor((asc + (COLS - desc)) / 2);
        barPhase = 'rendering';

        await new Promise<void>((r) =>
          requestAnimationFrame(() => requestAnimationFrame(() => r())),
        );

        const workflow = $workflowRun.workflow;
        enrichGroups(
          workflow?.pendingActivities ?? [],
          workflow?.pendingNexusOperations ?? [],
        );
        bufferGroups = getGroupArray();

        fetchComplete = true;
        workflowActionsReady.set(true);
      })
      .catch((e: unknown) => {
        if (e instanceof Error && e.name !== 'AbortError') {
          error = e.message;
        }
      });
  }

  onMount(() => {
    workflowActionsReady.set(false);
    start();
    return () => {
      controller.abort();
      workflowActionsReady.set(true);
    };
  });

  beforeNavigate(() => {
    clearActives();
  });

  const urlParams = $derived(parseEventFilterParams(page.url));
  $effect(() => {
    $eventFilterSort = urlParams.sort;
  });

  const reverseSort = $derived($eventFilterSort === 'descending');

  const onSort = () => {
    const newSort = reverseSort ? 'ascending' : 'descending';
    updateEventFilterParams(page.url, { sort: newSort }, goto);
  };

  let showDownloadPrompt = $state(false);

  const fmt = (n: number) => n.toLocaleString();
  const fmtMs = (ms: number) =>
    ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(2)}s`;

  const total = $derived(stats?.totalEvents ?? progress?.totalEstimated ?? 0);
  const done = $derived(stats !== null);

  const ascPct = $derived.by(() => {
    if (stats)
      return (stats.ascPages / (stats.ascPages + stats.descPages)) * 100;
    if (!progress || !total) return 0;
    return Math.min(100, (progress.ascMaxId / total) * 100);
  });

  const descPct = $derived.by(() => {
    if (stats)
      return (stats.descPages / (stats.ascPages + stats.descPages)) * 100;
    if (!progress || !total || !progress.descMinId) return 0;
    return Math.min(100, ((total - progress.descMinId + 1) / total) * 100);
  });

  const COLS = 40;
  const ascCols = $derived(Math.floor((ascPct / 100) * COLS));
  const descCols = $derived(Math.floor((descPct / 100) * COLS));

  let frozenMeetCol = $state(COLS / 2);

  function boxState(col: number): string {
    if (barPhase === 'rendering') return 'box-done';
    if (col < ascCols) return 'box-asc';
    if (col >= COLS - descCols) return 'box-desc';
    if (!progress) return 'box-idle';
    return 'box-empty';
  }

  const workflow = $derived($workflowRun.workflow);

  const workflowTaskFailedError = $derived(
    fetchComplete
      ? (getBufferWftFailedEvent() as
          | WorkflowTaskFailedEvent
          | WorkflowTaskTimedOutEvent
          | undefined)
      : undefined,
  );

  const filteredBufferGroups = $derived.by(() => {
    const active = $eventTypeFilter;
    return bufferGroups.filter((g) => active.includes(g.category));
  });

  // PERF SORT: never reverse the array — always pass ascending key order so
  // Svelte's {#each} never needs to reorder DOM nodes. reverseSort is threaded
  // into TimelineGraph which flips y coordinates instead. The !reverseSort arg
  // to orderGroupsByPending puts pending groups at the visually correct position
  // for each mode: front (low i, low y) in ascending, back (high i, low y in
  // descending mirror) so they always appear at the top of the viewport.
  const groups = $derived(
    orderGroupsByPending(filteredBufferGroups, !reverseSort),
  );
</script>

{#if error}
  <p class="text-sm text-danger">{error}</p>
{/if}
<InputAndResults />
<div class="flex flex-col gap-2">
  {#if workflowTaskFailedError}
    <WorkflowError
      error={workflowTaskFailedError}
      pendingTask={workflow?.pendingWorkflowTask}
    />
  {/if}
  {#if workflow?.callbacks?.length}
    <WorkflowCallbacks callbacks={workflow.callbacks} />
  {/if}
</div>
<div class="relative pb-24">
  <div
    class="surface-background sticky top-0 z-[11] flex flex-wrap items-center justify-between gap-2 border-b border-subtle pb-2 md:top-[var(--top-nav-height)] md:pt-2 xl:gap-8"
  >
    <div class="flex items-center gap-2">
      <h2>{translate('workflows.timeline-tab')}</h2>
      <EventHistoryLegend />
    </div>
    <div class="flex items-center gap-2">
      <ToggleButtons>
        <ToggleButton
          leadingIcon={reverseSort ? 'descending' : 'ascending'}
          on:click={onSort}
          size="sm">{reverseSort ? 'Descending' : 'Ascending'}</ToggleButton
        >
        <EventTypeFilter compact={false} />
        <ToggleButton
          data-testid="download"
          leadingIcon="download"
          size="sm"
          on:click={() => (showDownloadPrompt = true)}
        >
          {translate('common.download')}
        </ToggleButton>
      </ToggleButtons>
    </div>
    {#if firstRenderMs !== null}
      <p class="w-full text-right font-mono text-xs text-secondary">
        first paint {fmtMs(firstRenderMs)}{#if loadMs !== null}
          · fetch {fmtMs(loadMs)}{/if}{#if allRenderMs !== null}
          · all loaded {fmtMs(allRenderMs)}{/if}
      </p>
    {/if}
  </div>
  {#if barPhase !== 'done'}
    <div
      class="progress-root"
      role="progressbar"
      aria-label="Bidirectional fetch progress"
      aria-valuenow={ascPct + descPct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {#if barPhase === 'rendering'}
        <div class="rendering-overlay" aria-hidden="true"></div>
      {/if}
      {#each { length: COLS } as _, col}
        {@const state = boxState(col)}
        {@const isFrontierAsc =
          barPhase === 'fetching' && col === ascCols - 1 && ascCols > 0}
        {@const isFrontierDesc =
          barPhase === 'fetching' &&
          col === COLS - descCols &&
          descCols > 0 &&
          COLS - descCols < COLS}
        {@const delay =
          barPhase === 'rendering' ? Math.abs(col - frozenMeetCol) * 18 : 0}
        <div
          class="box {state} {isFrontierAsc
            ? 'frontier-asc'
            : isFrontierDesc
              ? 'frontier-desc'
              : ''}"
          style={barPhase === 'rendering'
            ? `animation-delay: ${delay}ms`
            : undefined}
        ></div>
      {/each}
    </div>
  {/if}
  {#if workflow}
    <div class="flex w-full flex-col">
      <TimelineGraph
        {workflow}
        {groups}
        {reverseSort}
        loading={!fetchComplete}
        totalExpectedEvents={progress?.totalEstimated ?? 0}
        descMinId={progress?.descMinId ?? 0}
        startedAt={t0}
        onFirstRender={(ms) => {
          firstRenderMs = ms;
        }}
        onAllRendered={(ms) => {
          allRenderMs = ms;
          barPhase = 'done';
        }}
        viewportHeight={undefined}
        error={Boolean(workflowTaskFailedError)}
      />
    </div>
  {/if}
</div>
{#if workflow}
  <DownloadEventHistoryModal
    bind:open={showDownloadPrompt}
    {namespace}
    workflowId={workflow.id}
    runId={workflow.runId}
  />
{/if}

<style lang="postcss">
  .progress-root {
    @apply w-full;

    position: relative;
    display: grid;
    grid-template-columns: repeat(40, 1fr);
    gap: 2px;
    height: 24px;
  }

  .box {
    @apply rounded-sm;
  }

  .box-idle {
    background-color: color-mix(
      in oklab,
      var(--color-primary, #6366f1) 8%,
      transparent
    );
  }

  .box-empty {
    background-color: color-mix(in oklab, currentColor 10%, transparent);
  }

  .box-asc {
    background-color: var(--color-blue-500, #3b82f6);
    animation: pop 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .box-desc {
    background-color: var(--color-purple-500, #a855f7);
    animation: pop 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .box-done {
    background-color: var(--color-green-500, #22c55e);
    animation: pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  .frontier-asc {
    animation: pulseBlue 0.9s ease-in-out infinite;
    will-change: filter;
  }

  .frontier-desc {
    animation: pulsePurple 0.9s ease-in-out infinite;
    will-change: filter;
  }

  .rendering-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    overflow: hidden;
    border-radius: inherit;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 55%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent 0%,
        color-mix(in oklab, #6366f1 20%, transparent) 25%,
        color-mix(in oklab, #a855f7 45%, transparent) 50%,
        color-mix(in oklab, #6366f1 20%, transparent) 75%,
        transparent 100%
      );
      animation: rendering-wave 1.3s ease-in-out infinite;
      will-change: transform;
    }
  }

  @keyframes rendering-wave {
    from {
      transform: translateX(-100%);
    }

    to {
      transform: translateX(182%);
    }
  }

  @keyframes pop {
    0% {
      transform: scale(0.55);
      opacity: 0.6;
    }

    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes pulseBlue {
    0%,
    100% {
      filter: brightness(1);
    }

    50% {
      filter: brightness(1.6) saturate(1.2);
    }
  }

  @keyframes pulsePurple {
    0%,
    100% {
      filter: brightness(1);
    }

    50% {
      filter: brightness(1.6) saturate(1.2);
    }
  }
</style>
