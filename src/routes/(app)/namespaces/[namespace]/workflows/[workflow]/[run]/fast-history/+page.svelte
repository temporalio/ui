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
  import { groupEvents } from '$lib/models/event-groups';
  import {
    type BidirectionalProgress,
    type BidirectionalStats,
    fetchAllEventsBidirectional,
  } from '$lib/services/events-service';
  import { clearActives } from '$lib/stores/active-events';
  import { eventFilterSort } from '$lib/stores/event-view';
  import {
    currentEventHistory,
    filteredEventHistory,
    fullEventHistory,
  } from '$lib/stores/events';
  import { workflowActionsReady } from '$lib/stores/workflow-actions-ready';
  import { workflowRun } from '$lib/stores/workflow-run';
  import {
    parseEventFilterParams,
    updateEventFilterParams,
  } from '$lib/utilities/event-filter-params';
  import { getWorkflowTaskFailedEvent } from '$lib/utilities/get-workflow-task-failed-event';
  import { orderGroupsByPending } from '$lib/utilities/order-groups-by-pending';

  const { namespace, workflow: workflowId, run: runId } = $derived(page.params);

  let progress = $state<BidirectionalProgress | null>(null);
  let stats = $state<BidirectionalStats | null>(null);
  let error = $state<string | null>(null);
  let showTimeline = $state(false);
  let controller: AbortController;

  export { stats, progress };

  function start() {
    progress = null;
    stats = null;
    error = null;
    showTimeline = false;
    controller?.abort();
    controller = new AbortController();

    fetchAllEventsBidirectional({
      namespace,
      workflowId,
      runId,
      signal: controller.signal,
      maximumPageSize: 1000,
      onProgress: (p) => {
        progress = p;
      },
    })
      .then(({ events, stats: s }) => {
        stats = s;
        fullEventHistory.set(events);
        // Also populate currentEventHistory so filteredEventHistory (used by
        // EventTypeFilter and WorkflowError) derives correctly from these events.
        currentEventHistory.set(events);
        const waveMs = Math.floor((COLS / 2) * 18) + 400;
        setTimeout(() => {
          showTimeline = true;
          workflowActionsReady.set(true);
        }, waveMs);
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

  const COLS = 40;
  const ROWS = 10;

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

  const ascCols = $derived(done ? COLS : Math.floor((ascPct / 100) * COLS));
  const descCols = $derived(done ? COLS : Math.floor((descPct / 100) * COLS));

  function boxState(col: number) {
    if (done) return 'done';
    if (col < ascCols) return 'asc';
    if (col >= COLS - descCols) return 'desc';
    return 'empty';
  }

  const meetCol = $derived(Math.floor((ascCols + (COLS - descCols)) / 2));

  const workflow = $derived($workflowRun.workflow);

  const workflowTaskFailedError = $derived(
    getWorkflowTaskFailedEvent($currentEventHistory, 'ascending'),
  );

  const ascendingGroups = $derived.by(() => {
    if (!showTimeline || !workflow) return [];
    return groupEvents(
      $filteredEventHistory,
      'ascending',
      workflow.pendingActivities ?? [],
      workflow.pendingNexusOperations ?? [],
    );
  });

  // PERF SORT: never reverse the array — always pass ascending key order so
  // Svelte's {#each} never needs to reorder DOM nodes. reverseSort is threaded
  // into TimelineGraph which flips y coordinates instead. The !reverseSort arg
  // to orderGroupsByPending puts pending groups at the visually correct position
  // for each mode: front (low i, low y) in ascending, back (high i, low y in
  // descending mirror) so they always appear at the top of the viewport.
  const groups = $derived(orderGroupsByPending(ascendingGroups, !reverseSort));
</script>

{#if showTimeline}
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
    </div>
    {#if workflow}
      <div class="flex w-full flex-col">
        <TimelineGraph
          {workflow}
          {groups}
          {reverseSort}
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
{:else}
  <div class="flex h-[60dvh] flex-col justify-center gap-3 px-6">
    {#if error}
      <p class="text-sm text-danger">{error}</p>
    {:else}
      <div class="flex items-center justify-between text-xs text-secondary">
        <span class="flex items-center gap-1.5">
          <span class="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
          Ascending
          {#if progress || stats}· {fmt(
              stats?.ascPages ?? progress?.ascPages ?? 0,
            )}p{/if}
        </span>
        <span class="tabular-nums">
          {#if done}
            {fmtMs(stats.durationMs)} · {fmt(stats.totalEvents)} events · {fmt(
              stats.eventsPerSecond,
            )}/s
          {:else if progress}
            {fmtMs(progress.elapsedMs)} · {fmt(
              progress.ascEvents + progress.descEvents,
            )} events
          {:else}
            Starting…
          {/if}
        </span>
        <span class="flex items-center gap-1.5">
          {#if progress || stats}{fmt(
              stats?.descPages ?? progress?.descPages ?? 0,
            )}p ·{/if}
          Descending
          <span class="inline-block h-2 w-2 rounded-full bg-purple-500"></span>
        </span>
      </div>

      <div
        class="grid flex-1 gap-0.5 {!progress && !done ? 'breathe' : ''}"
        style="grid-template-columns: repeat({COLS}, 1fr); grid-template-rows: repeat({ROWS}, 1fr); contain: layout style paint;"
        role="progressbar"
        aria-label="Bidirectional fetch progress"
        aria-valuenow={ascPct + descPct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {#each { length: ROWS } as _, row}
          {#each { length: COLS } as _, col}
            {@const state = boxState(col)}
            {@const isFrontierAsc = !done && col === ascCols - 1}
            {@const isFrontierDesc = !done && col === COLS - descCols}
            {@const doneDelay = Math.abs(col - meetCol) * 18}
            <div
              class="box rounded-sm {state === 'asc'
                ? 'box-asc'
                : state === 'desc'
                  ? 'box-desc'
                  : state === 'done'
                    ? 'box-done'
                    : !progress
                      ? 'box-idle'
                      : 'box-empty'} {isFrontierAsc
                ? 'frontier-asc'
                : isFrontierDesc
                  ? 'frontier-desc'
                  : ''}"
              style={state === 'done' ? `animation-delay: ${doneDelay}ms` : ''}
            ></div>
          {/each}
        {/each}
      </div>

      {#if total}
        <div class="relative flex justify-between text-xs text-secondary">
          <span>1</span>
          {#if !done && progress?.ascMaxId && progress?.descMinId}
            <span
              class="absolute font-medium text-blue-500"
              style="left:{ascPct}%;transform:translateX(-50%)"
            >
              {fmt(progress.ascMaxId)} ↑
            </span>
            <span
              class="absolute font-medium text-purple-500"
              style="right:{descPct}%;transform:translateX(50%)"
            >
              ↓ {fmt(progress.descMinId)}
            </span>
          {/if}
          <span>{fmt(total)}</span>
        </div>
      {/if}
    {/if}
  </div>
{/if}

<style>
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

  .breathe {
    animation: breathe 2.5s ease-in-out infinite;
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

  @keyframes breathe {
    0%,
    100% {
      opacity: 0.3;
    }

    50% {
      opacity: 0.7;
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
