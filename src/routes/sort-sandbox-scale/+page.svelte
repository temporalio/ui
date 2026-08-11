<script lang="ts">
  import {
    type LoadProgress,
    SnapshotClient,
    type SortTerm,
  } from '$lib/components/workflow/sort-sandbox/columnar/client';
  import type { DisplayRow } from '$lib/components/workflow/sort-sandbox/columnar/store';
  import Button from '$lib/holocene/button.svelte';

  // Measured: a sharded parallel pull sustains ~301k rows/s at the browser's
  // real concurrency limit of 6. Pacing the load to that keeps the wait honest.
  const ROWS_PER_SECOND = 301_000;
  const ROW_HEIGHT = 34;
  // Browsers clamp element height near 33.5M px. 12M rows at 34px would need
  // 408M px, so past ~980k rows a spacer-sized-to-content silently stops
  // scrolling and the grid renders nothing. Compress the scroll range and map
  // scroll position onto the row range instead.
  const MAX_SPACER_PX = 12_000_000;

  let rowCount = $state(12_000_000);
  let client: SnapshotClient | null = null;

  let phase = $state<'idle' | 'loading' | 'ready'>('idle');
  let progress = $state<LoadProgress>({
    loaded: 0,
    scanned: 0,
    total: 0,
    elapsedMs: 0,
  });
  let loadedCount = $state(0);
  let storeBytes = $state(0);
  let loadMs = $state(0);

  let sortTerms = $state<SortTerm[]>([{ key: 'startTime', direction: 'desc' }]);
  let sortMs = $state<number | null>(null);
  let sortsCompleted = $state(0);
  let filterMs = $state<number | null>(null);
  let visibleCount = $state(0);
  let textFilter = $state('');

  let rows = $state<DisplayRow[]>([]);
  let windowOffset = $state(0);
  let scroller = $state<HTMLDivElement>();
  let viewportHeight = $state(600);
  let scrollTop = $state(0);
  // window requests are async, so a slower earlier one can land after a newer
  // one and paint stale rows. Only the latest request may write.
  let windowSeq = 0;

  const totalPx = $derived(visibleCount * ROW_HEIGHT);
  const spacerPx = $derived(Math.min(totalPx, MAX_SPACER_PX));
  const scale = $derived(totalPx / Math.max(1, spacerPx));

  const mb = (bytes: number) => (bytes / 1048576).toFixed(0) + ' MB';
  const n = (value: number) => value.toLocaleString('en-US');

  const SORTS: { label: string; terms: SortTerm[] }[] = [
    { label: 'Start ↓', terms: [{ key: 'startTime', direction: 'desc' }] },
    { label: 'Start ↑', terms: [{ key: 'startTime', direction: 'asc' }] },
    { label: 'Status', terms: [{ key: 'status', direction: 'asc' }] },
    { label: 'Workflow ID', terms: [{ key: 'workflowId', direction: 'asc' }] },
    {
      label: 'End (nulls last)',
      terms: [{ key: 'endTime', direction: 'desc' }],
    },
    {
      label: 'Status → Type → Start ↓',
      terms: [
        { key: 'status', direction: 'asc' },
        { key: 'type', direction: 'asc' },
        { key: 'startTime', direction: 'desc' },
      ],
    },
  ];

  const refreshWindow = async () => {
    if (!client || phase !== 'ready') return;
    scrollTop = scroller?.scrollTop ?? 0;
    const virtualTop = scrollTop * scale;
    const count = Math.ceil(viewportHeight / ROW_HEIGHT) + 4;
    const first = Math.min(
      Math.max(0, Math.floor(virtualTop / ROW_HEIGHT)),
      Math.max(0, visibleCount - count),
    );
    const seq = ++windowSeq;
    const result = await client.window(first, count);
    if (seq !== windowSeq) return;
    windowOffset = result.offset;
    rows = result.rows;
  };

  const start = async () => {
    client?.dispose();
    client = new SnapshotClient();
    // POC harness: exposed so tests can verify ordering directly rather than
    // inferring it from what happens to be on screen
    (globalThis as unknown as { __snapshot: unknown }).__snapshot = client;
    phase = 'loading';
    sortMs = null;
    filterMs = null;

    const result = await client.load(rowCount, ROWS_PER_SECOND, [], (p) => {
      progress = p;
    });

    loadedCount = result.count;
    storeBytes = result.bytes;
    loadMs = result.elapsedMs;
    visibleCount = result.count;
    phase = 'ready';
    await refreshWindow();
  };

  const applySort = async (terms: SortTerm[]) => {
    if (!client) return;
    sortTerms = terms;
    const sorted = await client.sort(terms);
    sortMs = sorted.ms;
    sortsCompleted += 1;
    const filtered = await client.filter(textFilter, [], '');
    filterMs = filtered.ms;
    visibleCount = filtered.count;
    if (scroller) scroller.scrollTop = 0;
    await refreshWindow();
  };

  const applyFilter = async () => {
    if (!client) return;
    const filtered = await client.filter(textFilter, [], '');
    filterMs = filtered.ms;
    visibleCount = filtered.count;
    if (scroller) scroller.scrollTop = 0;
    await refreshWindow();
  };

  const describe = (terms: SortTerm[]) =>
    terms.map((term) => `${term.key} ${term.direction}`).join(', then ');
</script>

<svelte:head><title>Sort sandbox — scale harness</title></svelte:head>

<div class="flex h-screen flex-col gap-4 p-6 text-primary">
  <div>
    <h1 class="text-xl font-medium">Sort sandbox — scale harness</h1>
    <p class="mt-1 max-w-prose text-sm text-secondary">
      Holds the whole snapshot in a worker as columnar typed arrays and sorts an
      index permutation. No cap, no object array. Load is paced to 301k rows/s,
      the throughput a sharded parallel pull actually sustains at the browser's
      6-connection limit.
    </p>
  </div>

  <div class="flex flex-wrap items-center gap-3">
    <label class="flex items-center gap-2 text-sm">
      Rows
      <input
        type="number"
        bind:value={rowCount}
        step="1000000"
        min="100000"
        max="20000000"
        class="surface-primary w-40 border border-subtle px-2 py-1"
      />
    </label>
    <Button
      onclick={start}
      disabled={phase === 'loading'}
      data-testid="start-load"
    >
      {phase === 'loading' ? 'Loading…' : `Load ${n(rowCount)} rows`}
    </Button>
    {#if phase === 'ready'}
      <span class="text-sm" data-testid="load-summary">
        <strong>{n(loadedCount)}</strong> rows · {mb(storeBytes)} columns · loaded
        in {(loadMs / 1000).toFixed(1)}s
      </span>
    {/if}
  </div>

  {#if phase === 'loading'}
    <div>
      <div
        class="surface-subtle h-2 w-full max-w-2xl overflow-hidden border border-subtle"
      >
        <div
          class="surface-interactive h-full"
          style="width: {(progress.loaded / Math.max(1, progress.total)) *
            100}%"
        ></div>
      </div>
      <p class="mt-2 text-sm tabular-nums">
        {n(progress.loaded)} / {n(progress.total)} ·
        {(progress.elapsedMs / 1000).toFixed(1)}s
      </p>
    </div>
  {/if}

  {#if phase === 'ready'}
    <div class="flex flex-wrap items-center gap-2">
      {#each SORTS as option (option.label)}
        <Button
          size="xs"
          variant="secondary"
          onclick={() => applySort(option.terms)}
        >
          {option.label}
        </Button>
      {/each}
      <input
        placeholder="filter…"
        bind:value={textFilter}
        onchange={applyFilter}
        class="surface-primary border border-subtle px-2 py-1 text-sm"
        data-testid="filter-input"
      />
    </div>

    <div class="flex flex-wrap gap-6 text-sm" data-testid="timings">
      <span
        >sort <strong
          >{sortMs === null ? '—' : Math.round(sortMs) + 'ms'}</strong
        ></span
      >
      <span
        >filter <strong
          >{filterMs === null ? '—' : Math.round(filterMs) + 'ms'}</strong
        ></span
      >
      <span>showing <strong>{n(visibleCount)}</strong></span>
      <span data-testid="window-offset">offset {n(windowOffset)}</span>
      <span data-testid="sorts-completed">{sortsCompleted}</span>
      <span class="text-secondary">{describe(sortTerms)}</span>
    </div>

    <div
      bind:this={scroller}
      bind:clientHeight={viewportHeight}
      onscroll={refreshWindow}
      class="surface-primary min-h-0 flex-1 overflow-auto border border-subtle"
      data-testid="grid"
    >
      <div class="relative" style="height: {spacerPx}px">
        <!-- the rendered window rides with the viewport rather than sitting at
        its true offset, which no longer exists once the range is compressed -->
        <div class="absolute inset-x-0" style="top: {scrollTop}px">
          {#each rows as row (row.runId)}
            <div
              class="flex items-center gap-4 border-b border-subtle px-3 text-xs"
              style="height: {ROW_HEIGHT}px"
            >
              <span class="w-28 shrink-0">{row.status}</span>
              <span class="w-64 shrink-0 truncate font-mono"
                >{row.workflowId}</span
              >
              <span class="w-56 shrink-0 truncate">{row.type}</span>
              <span class="w-44 shrink-0 tabular-nums"
                >{new Date(row.startTime)
                  .toISOString()
                  .replace('T', ' ')
                  .slice(0, 19)}</span
              >
              <span class="w-44 shrink-0 tabular-nums text-secondary">
                {row.endTime
                  ? new Date(row.endTime)
                      .toISOString()
                      .replace('T', ' ')
                      .slice(0, 19)
                  : '—'}
              </span>
              <span class="shrink-0">{row.taskQueue}</span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>
