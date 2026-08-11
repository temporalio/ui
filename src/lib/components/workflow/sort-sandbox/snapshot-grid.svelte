<script lang="ts" module>
  const ROW_HEIGHT = 38;

  // Browsers clamp element height near 33.5M px. At 38px a spacer sized to
  // content stops scrolling around 880k rows and then renders nothing, so the
  // scroll range is compressed and mapped onto the row range instead.
  const MAX_SPACER_PX = 12_000_000;

  const STATUS_COLORS: Record<string, string> = {
    Running: 'bg-blue-300',
    Completed: 'bg-green-200',
    Failed: 'bg-red-200',
    TimedOut: 'bg-orange-200',
    Canceled: 'bg-slate-100',
    Terminated: 'bg-yellow-200',
    ContinuedAsNew: 'bg-purple-200',
  };
</script>

<script lang="ts">
  import { untrack } from 'svelte';

  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';

  import type { DisplayRow } from './columnar/store';
  import {
    GRID_MIN_WIDTH,
    SANDBOX_COLUMNS,
    type SortKey,
    type SortTerm,
  } from './sorting';

  interface Props {
    rows: DisplayRow[];
    windowOffset: number;
    total: number;
    sortTerms: SortTerm[];
    sorting?: boolean;
    onSort: (key: SortKey, additive: boolean) => void;
    onWindowChange: (start: number, size: number) => void;
    formatTime: (value: number | null) => string;
  }

  let {
    rows,
    windowOffset,
    total,
    sortTerms,
    sorting = false,
    onSort,
    onWindowChange,
    formatTime,
  }: Props = $props();

  let scroller = $state<HTMLDivElement>();
  let headerScroller = $state<HTMLDivElement>();
  let scrollTop = $state(0);
  let viewportHeight = $state(600);

  const totalPx = $derived(total * ROW_HEIGHT);
  const spacerPx = $derived(Math.min(totalPx, MAX_SPACER_PX));
  const scale = $derived(totalPx / Math.max(1, spacerPx));

  const sortIndexFor = (key: SortKey) =>
    sortTerms.findIndex((term) => term.key === key);

  const requestWindow = () => {
    const size = Math.ceil(viewportHeight / ROW_HEIGHT) + 4;
    const virtualTop = scrollTop * scale;
    const start = Math.min(
      Math.max(0, Math.floor(virtualTop / ROW_HEIGHT)),
      Math.max(0, total - size),
    );
    onWindowChange(start, size);
  };

  const handleScroll = () => {
    if (!scroller) return;
    scrollTop = scroller.scrollTop;
    if (headerScroller) headerScroller.scrollLeft = scroller.scrollLeft;
    requestWindow();
  };

  // Reset to the top whenever the result set or viewport changes. The body is
  // untracked because it both reads and writes scrollTop, and an effect that
  // depends on what it writes re-runs forever and pegs the main thread.
  $effect(() => {
    void total;
    const height = viewportHeight;
    untrack(() => {
      if (scroller) scroller.scrollTop = 0;
      scrollTop = 0;
      onWindowChange(0, Math.ceil(height / ROW_HEIGHT) + 4);
    });
  });
</script>

<div
  class="surface-primary flex min-h-0 flex-1 flex-col overflow-hidden border border-subtle"
>
  <div bind:this={headerScroller} class="shrink-0 overflow-hidden">
    <div
      class="surface-table-header flex border-b border-subtle"
      style="min-width: {GRID_MIN_WIDTH}px"
      role="row"
    >
      {#each SANDBOX_COLUMNS as column (column.key)}
        {@const sortIndex = sortIndexFor(column.key)}
        {@const term = sortIndex >= 0 ? sortTerms[sortIndex] : undefined}
        <button
          type="button"
          class="flex shrink-0 items-center gap-1 overflow-hidden px-3 py-2 text-left text-xs font-medium text-primary hover:surface-interactive-ghost focus-visible:outline focus-visible:outline-blue-700"
          style="width: {column.width}"
          aria-label="Sort by {column.label}"
          onclick={(event) => onSort(column.key, event.shiftKey)}
        >
          <span class="truncate">{column.label}</span>
          {#if term}
            <Icon
              name={term.direction === 'asc' ? 'arrow-up' : 'arrow-down'}
              class="shrink-0"
            />
            {#if sortTerms.length > 1}
              <span
                class="surface-inverse shrink-0 rounded-sm px-1 text-[10px] font-bold leading-4 text-inverse"
                title="Sort priority {sortIndex + 1}"
              >
                {sortIndex + 1}
              </span>
            {/if}
          {/if}
        </button>
      {/each}
    </div>
  </div>

  <div
    bind:this={scroller}
    bind:clientHeight={viewportHeight}
    class="relative min-h-0 flex-1 overflow-auto"
    onscroll={handleScroll}
    data-testid="snapshot-grid"
  >
    {#if sorting}
      <div
        class="absolute inset-0 z-10 flex items-start justify-center pt-10 text-sm text-secondary"
      >
        Sorting…
      </div>
    {/if}

    {#if total === 0}
      <EmptyState title="No loaded workflows match these filters" icon="search">
        <p class="max-w-prose text-center text-sm text-secondary">
          Clear the text filter, or turn off a status chip, to bring rows back.
          Filtering happens inside the snapshot — it never hits the server, so
          nothing here can find workflows that were not loaded.
        </p>
      </EmptyState>
    {:else}
      <div
        class="relative"
        style="height: {spacerPx}px; min-width: {GRID_MIN_WIDTH}px"
        class:opacity-40={sorting}
      >
        <!-- the rendered window rides with the viewport: past ~880k rows a true
        absolute offset no longer exists once the scroll range is compressed -->
        <div class="absolute inset-x-0" style="top: {scrollTop}px">
          {#each rows as row}
            <div
              class="flex items-center border-b border-subtle text-xs"
              style="height: {ROW_HEIGHT}px"
              role="row"
            >
              <span class="shrink-0 px-3" style="width: 120px">
                <span
                  class="inline-block rounded-sm px-1 py-0.5 text-xs font-medium text-black {STATUS_COLORS[
                    row.status
                  ] ?? 'bg-slate-100'}"
                >
                  {row.status}
                </span>
              </span>
              <span
                class="flex shrink-0 items-baseline gap-2 overflow-hidden px-3"
                style="width: 260px"
              >
                <span class="truncate">{row.workflowId}</span>
                <span class="shrink-0 text-[10px] text-subtle"
                  >{row.runId.slice(0, 8)}…</span
                >
              </span>
              <span class="shrink-0 truncate px-3" style="width: 200px"
                >{row.type}</span
              >
              <span
                class="shrink-0 truncate px-3 tabular-nums"
                style="width: 160px">{formatTime(row.startTime)}</span
              >
              <span
                class="shrink-0 truncate px-3 tabular-nums text-secondary"
                style="width: 160px">{formatTime(row.endTime)}</span
              >
              <span class="shrink-0 truncate px-3" style="width: 140px"
                >{row.taskQueue}</span
              >
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
