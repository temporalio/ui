<script lang="ts">
  import { onMount, untrack } from 'svelte';

  import { IconLink, IconPause, IconPlay } from '$lib/io/icon';

  import { type ChainRun, type LiveRunState } from './run-chain';
  import { RunChainReader, type RunHistory } from './run-chain-reader';
  import type { RunSummary } from './run-chain-summary';
  import { chainRunColor } from './run-chain-visual';

  import RunChainCanvas from './run-chain-canvas.svelte';

  let {
    namespace,
    workflowId,
    runId,
  }: { namespace: string; workflowId: string; runId: string } = $props();
  let runs = $state<ChainRun[]>([]);
  let histories = $state<Record<string, RunHistory>>({});
  let summaries = $state<Record<string, RunSummary>>({});
  let summaryErrors = $state<Record<string, string>>({});
  let backfilling = false;
  let wantEarlier = false;
  let visibleRunIds: string[] = [];
  let liveState = $state<LiveRunState>();
  let liveError = $state('');
  let loadingRuns = $state<string[]>([]);
  let historyErrors = $state<Record<string, string>>({});
  let busy = $state(false);
  let ready = $state(false);
  let error = $state('');
  let earlierError = $state('');
  let hasEarlier = $state(false);
  let hasLater = $state(false);
  let paused = $state(false);
  let selectedRunId = $state('');
  let now = $state(Date.now());
  let reader: RunChainReader;
  let controller: AbortController;
  const latest = $derived(runs.at(-1));
  const focused = $derived(
    runs.find((run) => run.runId === selectedRunId) ?? latest,
  );
  const live = $derived(latest?.status === 'Running');
  const message = (error: unknown) =>
    error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : 'Could not load this run. Try again.';

  function publish() {
    if (controller.signal.aborted) return;
    runs = [...reader.runs];
    hasEarlier = reader.hasEarlier;
    hasLater = reader.hasLater;
    reader.retainHistories(
      [latest?.runId, focused?.runId].filter((id): id is string => !!id),
    );
    histories = Object.fromEntries(reader.histories);
    summaries = Object.fromEntries(reader.summaries);
  }

  async function loadHistory(run: ChainRun) {
    if (loadingRuns.includes(run.runId)) return;
    loadingRuns = [...loadingRuns, run.runId];
    historyErrors = { ...historyErrors, [run.runId]: '' };
    try {
      await reader.readHistory(run, liveState);
      publish();
    } catch (err) {
      if (!controller.signal.aborted)
        historyErrors = { ...historyErrors, [run.runId]: message(err) };
    } finally {
      loadingRuns = loadingRuns.filter((id) => id !== run.runId);
    }
  }

  async function refresh() {
    if (busy) return;
    busy = true;
    error = '';
    try {
      if (!ready) {
        await reader.initialize(runId);
        ready = true;
      } else {
        await reader.refresh();
      }
      publish();
      const tail = reader.runs.at(-1);
      if (tail) await loadHistory(tail);
      if (tail?.status === 'Running') {
        try {
          liveState = await reader.readLive(tail);
          liveError = '';
          reader.updateLiveSummary(tail, liveState);
        } catch (err) {
          if (!controller.signal.aborted) liveError = message(err);
        }
      } else {
        liveState = undefined;
        liveError = '';
      }
      void backfill();
    } catch (err) {
      if (!controller.signal.aborted) error = message(err);
    } finally {
      publish();
      busy = false;
    }
  }

  async function loadSummary(run: ChainRun) {
    try {
      await reader.readSummary(run, liveState);
      summaryErrors = { ...summaryErrors, [run.runId]: '' };
    } catch (err) {
      if (!controller.signal.aborted)
        summaryErrors = { ...summaryErrors, [run.runId]: message(err) };
    } finally {
      publish();
    }
  }

  async function loadEarlier() {
    earlierError = '';
    wantEarlier = true;
    await backfill();
  }

  async function backfill() {
    if (
      backfilling ||
      !ready ||
      controller.signal.aborted ||
      !reader.histories.has(reader.runs.at(-1)?.runId ?? '')
    )
      return;
    backfilling = true;
    try {
      while (
        reader.hasEarlier &&
        (reader.runs.length < 10 || wantEarlier) &&
        !earlierError &&
        !controller.signal.aborted &&
        (!paused || wantEarlier)
      ) {
        try {
          await reader.loadEarlier(1);
          wantEarlier = false;
        } catch (err) {
          if (!controller.signal.aborted) earlierError = message(err);
        }
        publish();
      }
      const pending = [...reader.runs]
        .filter((run) => visibleRunIds.includes(run.runId))
        .reverse()
        .filter((run) => {
          const summary = reader.summaries.get(run.runId);
          return (
            run.runId !== reader.runs.at(-1)?.runId &&
            !summaryErrors[run.runId] &&
            (!summary?.complete ||
              summary.scannedEvents < Number(run.eventCount))
          );
        });
      for (const run of pending) {
        if (controller.signal.aborted || paused) break;
        await loadSummary(run);
      }
    } finally {
      backfilling = false;
    }
  }

  let loadedSelection = '';
  $effect(() => {
    const id = selectedRunId;
    if (ready)
      untrack(() => {
        if (loadedSelection === id) return;
        loadedSelection = id;
        reader.retainHistories([id, reader.runs.at(-1)?.runId ?? '']);
        const run = reader.runs.find((run) => run.runId === id);
        if (run) void loadHistory(run);
        else publish();
      });
  });

  function windowChanged(ids: string[]) {
    visibleRunIds = ids;
    if (ready) void backfill();
  }

  onMount(() => {
    controller = new AbortController();
    reader = new RunChainReader(namespace, workflowId, controller.signal);
    void refresh();
    const poll = setInterval(() => {
      if (!paused && !document.hidden) void refresh();
    }, 3000);
    const summaryPoll = setInterval(() => {
      if (!paused && !document.hidden) void backfill();
    }, 2000);
    const clock = setInterval(() => {
      if (!paused) now = Date.now();
    }, 1000);
    return () => {
      controller.abort();
      clearInterval(poll);
      clearInterval(clock);
      clearInterval(summaryPoll);
    };
  });
</script>

<section
  class="chain"
  aria-label="Continue-As-New run chain"
  data-testid="run-chain-view"
>
  <div class="chain-toolbar">
    <div class="chain-title">
      <IconLink class="h-4 w-4" />
      <h2>Run chain</h2>
      <span class="facts">10-run view</span>
    </div>
    <div class="controls">
      <span class="update-status"
        ><span
          class="live-dot"
          style:background={paused
            ? undefined
            : chainRunColor(latest?.status ?? 'Unspecified')}
        ></span>{paused
          ? 'Updates paused'
          : hasLater
            ? 'Finding latest run…'
            : live
              ? 'Live · updates every 3s'
              : 'Chain ended'}</span
      >
      <button
        class="control"
        onclick={() => {
          paused = !paused;
          if (!paused) void refresh();
        }}
        aria-label={paused ? 'Resume updates' : 'Pause updates'}
        title={paused ? 'Resume updates' : 'Pause updates'}
        >{#if paused}<IconPlay class="h-3.5 w-3.5" />{:else}<IconPause
            class="h-3.5 w-3.5"
          />{/if}</button
      >
    </div>
  </div>
  {#if error}<div class="notice" role="alert">
      <span
        >{runs.length
          ? 'Updates interrupted. Showing the last loaded runs.'
          : 'Unable to load the run chain.'}
        {error}</span
      ><button onclick={refresh} disabled={busy}>Retry</button>
    </div>{/if}
  {#if !ready && busy}<div class="empty" role="status">
      <IconLink /><span>Connecting the runs…</span>
    </div>{/if}
  {#if earlierError}<div class="notice" role="alert">
      <span>Earlier history is unavailable. {earlierError}</span><button
        onclick={loadEarlier}
        disabled={busy}>Retry earlier runs</button
      >
    </div>
  {/if}
  {#if Object.values(summaryErrors).some(Boolean)}
    <div class="notice" role="status">
      <span>Some overview summaries are incomplete.</span><button
        onclick={() => {
          summaryErrors = {};
          void backfill();
        }}>Retry summaries</button
      >
    </div>
  {/if}
  <RunChainCanvas
    {liveState}
    {liveError}
    {runs}
    {hasLater}
    {hasEarlier}
    onloadearlier={loadEarlier}
    onwindowchange={windowChanged}
    {summaries}
    {histories}
    {historyErrors}
    {loadingRuns}
    {namespace}
    {workflowId}
    {now}
    onloadmore={loadHistory}
    bind:selectedRunId
  />
  {#if hasLater}<div class="boundary">
      <button disabled={busy} onclick={refresh}>Load more recent runs →</button>
    </div>{/if}
</section>

<style lang="postcss">
  .chain {
    @apply flex shrink-0 flex-col overflow-hidden rounded-lg border border-primary bg-surface-primary text-primary;
  }

  .chain-toolbar {
    @apply flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-primary px-4 py-2;
  }

  .chain-title,
  .controls {
    @apply flex items-center gap-3;
  }

  .chain-title > :global(svg) {
    @apply text-brand;
  }

  h2 {
    @apply text-sm font-semibold;
  }

  .facts {
    @apply text-xs text-secondary;
  }

  .control {
    @apply flex h-8 w-8 items-center justify-center rounded border border-primary;
  }

  .control:hover {
    @apply bg-surface-secondary;
  }

  .update-status {
    @apply flex items-center gap-2 text-xs text-secondary;
  }

  .live-dot {
    @apply h-1.5 w-1.5 rounded-full bg-border-secondary;
  }

  .boundary,
  .notice {
    @apply flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-primary bg-surface-secondary px-4 py-1 text-xs text-secondary;
  }

  .boundary button,
  .notice button {
    @apply min-h-8 text-brand underline;
  }

  button:disabled {
    @apply cursor-wait opacity-50;
  }

  button:focus-visible {
    @apply outline outline-2 outline-offset-2 outline-interactive-primary;
  }

  .empty {
    @apply flex min-h-40 flex-col items-center justify-center gap-3 text-sm text-secondary;
  }

  @media (pointer: coarse) {
    .control {
      @apply h-11 w-11;
    }
  }
</style>
