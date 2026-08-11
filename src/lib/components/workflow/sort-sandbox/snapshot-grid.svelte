<script lang="ts" module>
  const ROW_HEIGHT = 38;
  const BUFFER_ROWS = 6;

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
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';

  import type { SandboxWorkflow } from './mock-workflows';
  import {
    GRID_MIN_WIDTH,
    SANDBOX_COLUMNS,
    type SortKey,
    type SortTerm,
  } from './sorting';

  interface Props {
    rows: SandboxWorkflow[];
    sortTerms: SortTerm[];
    onSort: (key: SortKey, additive: boolean) => void;
    formatTime: (value: number | null) => string;
  }

  let { rows, sortTerms, onSort, formatTime }: Props = $props();

  let scroller = $state<HTMLDivElement>();
  let headerScroller = $state<HTMLDivElement>();
  let scrollTop = $state(0);
  let viewportHeight = $state(600);

  const firstIndex = $derived(
    Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS),
  );
  const lastIndex = $derived(
    Math.min(
      rows.length,
      firstIndex + Math.ceil(viewportHeight / ROW_HEIGHT) + BUFFER_ROWS * 2,
    ),
  );

  const windowedRows = $derived(
    rows.slice(firstIndex, lastIndex).map((workflow, offset) => ({
      workflow,
      index: firstIndex + offset,
    })),
  );

  const sortIndexFor = (key: SortKey) =>
    sortTerms.findIndex((term) => term.key === key);

  const handleScroll = () => {
    if (!scroller) return;
    scrollTop = scroller.scrollTop;
    // header lives outside the scroll container so the rows can be windowed,
    // so its horizontal offset has to be mirrored by hand
    if (headerScroller) headerScroller.scrollLeft = scroller.scrollLeft;
  };

  // jump back to the top whenever the result set changes out from under us
  $effect(() => {
    void rows;
    if (scroller) scroller.scrollTop = 0;
    scrollTop = 0;
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
    class="min-h-0 flex-1 overflow-auto"
    onscroll={handleScroll}
  >
    {#if rows.length === 0}
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
        style="height: {rows.length *
          ROW_HEIGHT}px; min-width: {GRID_MIN_WIDTH}px"
      >
        {#each windowedRows as { workflow, index } (workflow.runId)}
          <div
            class="absolute inset-x-0 flex items-center border-b border-subtle text-xs"
            style="top: {index * ROW_HEIGHT}px; height: {ROW_HEIGHT}px"
            role="row"
          >
            <span class="shrink-0 px-3" style="width: 120px">
              <span
                class="inline-block rounded-sm px-1 py-0.5 text-xs font-medium text-black {STATUS_COLORS[
                  workflow.status
                ]}"
              >
                {workflow.status}
              </span>
            </span>
            <span
              class="flex shrink-0 items-baseline gap-2 overflow-hidden px-3"
              style="width: 260px"
            >
              <span class="truncate">{workflow.workflowId}</span>
              <span class="shrink-0 text-[10px] text-subtle"
                >{workflow.runId.slice(0, 8)}…</span
              >
            </span>
            <span class="shrink-0 truncate px-3" style="width: 200px"
              >{workflow.type}</span
            >
            <span
              class="shrink-0 truncate px-3 tabular-nums"
              style="width: 160px">{formatTime(workflow.startTime)}</span
            >
            <span
              class="shrink-0 truncate px-3 tabular-nums text-secondary"
              style="width: 160px">{formatTime(workflow.endTime)}</span
            >
            <span class="shrink-0 truncate px-3" style="width: 140px"
              >{workflow.taskQueue}</span
            >
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>
