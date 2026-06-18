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
  let controller: AbortController;

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
      onFirstPage: (firstEvents) => {
        if (!firstEvents.length || reverseSort) return;
        fullEventHistory.set(firstEvents);
        currentEventHistory.set(firstEvents);
        workflowActionsReady.set(true);
      },
      onFirstDescPage: (bookendEvents) => {
        if (!bookendEvents.length) return;
        fullEventHistory.set(bookendEvents);
        currentEventHistory.set(bookendEvents);
        if (reverseSort) workflowActionsReady.set(true);
      },
    })
      .then(({ events, stats: s }) => {
        stats = s;
        loadMs = performance.now() - t0;
        fullEventHistory.set(events);
        currentEventHistory.set(events);
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

  const workflow = $derived($workflowRun.workflow);

  const workflowTaskFailedError = $derived(
    getWorkflowTaskFailedEvent($currentEventHistory, 'ascending'),
  );

  const ascendingGroups = $derived.by(() => {
    if (!workflow) return [];
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
  {#if !fetchComplete}
    <div
      class="relative h-6 w-full overflow-hidden rounded-sm bg-subtle"
      role="progressbar"
      aria-label="Bidirectional fetch progress"
      aria-valuenow={ascPct + descPct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        class="absolute left-0 top-0 h-full bg-blue-500 opacity-70 transition-[width] duration-300"
        style="width: {ascPct}%"
      ></div>
      <div
        class="absolute right-0 top-0 h-full bg-purple-500 opacity-70 transition-[width] duration-300"
        style="width: {descPct}%"
      ></div>
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
