<script lang="ts">
  import { tick, untrack } from 'svelte';

  import { getCategoryStrokeColor } from '$lib/components/lines-and-dots/colors';
  import { CategoryIcon } from '$lib/components/lines-and-dots/constants';
  import { timestamp } from '$lib/components/timestamp.svelte';
  import WorkflowStatusBadge from '$lib/components/workflow/workflow-status-badge.svelte';
  import { IconArrowRight, IconRetry, IconWarning } from '$lib/io/icon';
  import { timeFormat } from '$lib/stores/time-format';
  import { routeForWorkflow } from '$lib/utilities/route-for';
  import { getTimezone } from '$lib/utilities/timezone';

  import {
    type ChainRun,
    chainRunWindow,
    chainWorkflowStatus,
    formatChainDuration,
    type LiveRunState,
  } from './run-chain';
  import { compareRuns, runAttention } from './run-chain-comparison';
  import type { RunHistory } from './run-chain-reader';
  import type { RunSummary } from './run-chain-summary';
  import { summarySegments } from './run-chain-visual';

  import RunChainTimeline from './run-chain-timeline.svelte';

  let {
    runs,
    histories,
    summaries,
    liveState,
    liveError = '',
    historyErrors,
    loadingRuns,
    namespace,
    workflowId,
    now,
    onloadmore,
    selectedRunId = $bindable(''),
    hasLater = false,
    hasEarlier = false,
    onloadearlier,
    onwindowchange,
  }: {
    runs: ChainRun[];
    histories: Record<string, RunHistory>;
    summaries: Record<string, RunSummary>;
    liveState?: LiveRunState;
    liveError?: string;
    historyErrors: Record<string, string>;
    loadingRuns: string[];
    namespace: string;
    workflowId: string;
    now: number;
    onloadmore: (run: ChainRun) => void;
    selectedRunId?: string;
    hasLater?: boolean;
    hasEarlier?: boolean;
    onloadearlier: () => void;
    onwindowchange: (ids: string[]) => void;
  } = $props();
  let windowEndRunId = $state('');
  let pendingPreviousRunId = $state('');
  let runList = $state<HTMLDivElement>();
  const latest = $derived(runs.at(-1));
  const focused = $derived(
    runs.find((run) => run.runId === selectedRunId) ?? latest,
  );
  const visibleRuns = $derived(chainRunWindow(runs, windowEndRunId));
  const comparison = $derived(compareRuns(visibleRuns, summaries, now));
  const visibleKey = $derived(visibleRuns.map((run) => run.runId).join('|'));
  $effect(() => {
    const key = visibleKey;
    untrack(() => onwindowchange(key ? key.split('|') : []));
  });
  const number = (run: ChainRun) =>
    runs.findIndex((candidate) => candidate.runId === run.runId) + 1;
  const focusedIndex = $derived(focused ? number(focused) - 1 : -1);
  function revealSelectedRun() {
    const button = runList?.querySelector<HTMLButtonElement>(
      '[aria-pressed="true"]',
    );
    if (!runList || !button) return;
    const left = button.offsetLeft - 12;
    const right = button.offsetLeft + button.offsetWidth + 12;
    if (left < runList.scrollLeft) runList.scrollLeft = left;
    else if (right > runList.scrollLeft + runList.clientWidth)
      runList.scrollLeft = right - runList.clientWidth;
  }
  $effect(() => {
    const selection = focused?.runId;
    const visible = visibleKey;
    if (selection && visible) void tick().then(revealSelectedRun);
  });
  async function focusSelectedRun() {
    await tick();
    runList
      ?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
      ?.focus({ preventScroll: true });
    revealSelectedRun();
  }
  function select(run: ChainRun) {
    const index = number(run) - 1;
    const start = visibleRuns.length ? number(visibleRuns[0]) - 1 : 0;
    const end = start + visibleRuns.length - 1;
    windowEndRunId =
      run.runId === latest?.runId
        ? ''
        : (runs[
            index < start
              ? Math.min(runs.length - 1, index + 9)
              : index > end
                ? index
                : end
          ]?.runId ?? '');
    selectedRunId = run.runId === latest?.runId ? '' : run.runId;
    // Keep keyboard focus on the selected run when earlier history loads.
    if (runList?.contains(document.activeElement)) void focusSelectedRun();
  }
  function move(direction: -1 | 1) {
    if (pendingPreviousRunId && direction === -1) return;
    pendingPreviousRunId = '';
    const next = runs[focusedIndex + direction];
    if (next) select(next);
    else if (direction === -1 && hasEarlier && focused) {
      pendingPreviousRunId = focused.runId;
      onloadearlier();
    }
  }
  $effect(() => {
    if (!pendingPreviousRunId) return;
    const index = runs.findIndex((run) => run.runId === pendingPreviousRunId);
    if (index > 0) {
      pendingPreviousRunId = '';
      select(runs[index - 1]);
    } else if (!hasEarlier) pendingPreviousRunId = '';
  });
  function keydown(event: KeyboardEvent) {
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      !['ArrowLeft', 'ArrowRight'].includes(event.key)
    )
      return;
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest(
        'input, textarea, select, [contenteditable="true"], [role="textbox"], [role="dialog"], [role="menu"], [role="listbox"], [role="slider"]',
      )
    )
      return;
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
    void focusSelectedRun();
  }
  const duration = (run: ChainRun) =>
    Math.max(1, (run.closeTime ?? now) - run.startTime);
  const startDateFormatter = $derived(
    new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      timeZone: getTimezone($timeFormat),
    }),
  );
  const startTimeFormatter = $derived(
    new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
      timeZone: getTimezone($timeFormat),
    }),
  );
  function runLabel(run: ChainRun) {
    return `Started ${$timestamp(run.startTime, { relative: false })} · ${run.closeTime ? 'Duration' : 'Elapsed'} ${formatChainDuration(duration(run))} · ${run.status} · ${run.runId}`;
  }
  const count = new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  });
  const time = (value: number) =>
    new Date(value).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  function workLabel(row: (typeof comparison.rows)[number]) {
    return row.primitives
      .map(({ label, counts }) => `${counts.total} ${label.toLowerCase()}`)
      .join(' · ');
  }
</script>

<svelte:window onkeydown={keydown} />

<div class="canvas" data-testid="chain-canvas">
  {#if focused}
    <div class="workspace">
      <div class="overview">
        <div class="panel-heading">
          <div class="overview-heading">
            <strong
              >{!windowEndRunId ? 'Latest' : ''}
              {visibleRuns.length} runs</strong
            >
            <div class="run-navigation">
              {#if selectedRunId}<button
                  class="follow-latest"
                  onclick={() => {
                    if (latest) select(latest);
                  }}>Follow latest</button
                >{/if}
              <button
                onclick={() => move(-1)}
                disabled={focusedIndex <= 0 && !hasEarlier}
                aria-label="Previous run"
                title="Previous run (←)">←</button
              ><button
                onclick={() => move(1)}
                disabled={focusedIndex >= runs.length - 1}
                aria-label="Next run"
                title="Next run (→)">→</button
              >
            </div>
          </div>
          <small title="Use the left and right arrow keys to inspect runs"
            >Oldest → latest · ← / → to select</small
          >
        </div>
        <div class="run-list" data-testid="chain-overview" bind:this={runList}>
          {#each comparison.rows as row, index (row.run.runId)}
            {@const attention = runAttention(row, row.run.status)}
            {#if index > 0}<span class="run-connector" aria-hidden="true"
                ><IconArrowRight class="h-4 w-4" /></span
              >{/if}
            <button
              class="run-row"
              class:selected={row.run.runId === focused.runId}
              class:troubled={attention.trouble}
              onclick={() => select(row.run)}
              aria-pressed={row.run.runId === focused.runId}
              aria-label={`${runLabel(row.run)}. ${row.summary ? workLabel(row) || 'No recorded work' : 'Loading summary'}. ${attention.title}. ${row.totals.retried ? `${row.totals.retried} activities retried.` : ''}${!row.summary?.complete ? ' Partial history.' : ''}`}
              data-run-id={row.run.runId}
              data-testid="chain-comparison-row"
            >
              <span class="run-start" title={runLabel(row.run)}>
                <span class="run-time"
                  >{startTimeFormatter.format(row.run.startTime)}</span
                >
                <span class="run-date"
                  >{startDateFormatter.format(
                    row.run.startTime,
                  )}{#if row.run.runId === latest?.runId}<span
                      class="latest-label"
                      >{hasLater ? 'Newest loaded' : 'Latest'}</span
                    >{/if}</span
                >
              </span>
              <span
                class="duration-metric"
                title={`${row.run.closeTime === undefined ? 'Elapsed so far' : 'Duration'}: ${formatChainDuration(row.duration)}${comparison.durationMedian !== undefined ? ` · Median of displayed closed runs: ${formatChainDuration(comparison.durationMedian)}` : ''}`}
              >
                <span class="metric-caption"
                  >Duration{#if row.longer}<span
                      class="outlier"
                      title="At least 1.5× the median duration of the displayed closed runs"
                      >Longer</span
                    >{/if}</span
                >
                <span class="metric-value"
                  ><span
                    >{formatChainDuration(
                      row.duration,
                    )}{#if row.run.closeTime === undefined}<span
                        class="live-label"
                      >
                        live</span
                      >{/if}</span
                  ></span
                >
                <span class="metric-track"
                  ><span
                    class="duration-fill"
                    style:width={`${(row.duration / comparison.maxDuration) * 100}%`}
                  ></span></span
                >
              </span>
              <span
                class="work-metric"
                title={`${workLabel(row)}${comparison.workMedian !== undefined ? ` · Median of displayed complete, closed runs: ${comparison.workMedian} operations` : ''}. Counts represent recorded operations, not CPU or cost.`}
              >
                <span class="metric-caption"
                  >Work{#if row.heavier}<span
                      class="outlier"
                      title="At least 1.5× the median recorded operations of the displayed complete, closed runs"
                      >Heavier</span
                    >{/if}</span
                >
                <span class="metric-value"
                  ><span
                    >{row.summary
                      ? `${!row.summary.complete ? '≥' : ''}${row.totals.total} ops`
                      : '—'}</span
                  ></span
                >
                <span class="metric-track"
                  ><span
                    class="work-fill"
                    style:width={`${(row.totals.total / comparison.maxWork) * 100}%`}
                    >{#each row.primitives as primitive (primitive.kind)}<span
                        style:width={`${(primitive.counts.total / row.totals.total) * 100}%`}
                        style:background={getCategoryStrokeColor(
                          primitive.kind,
                        )}
                      ></span>{/each}</span
                  ></span
                >
              </span>
              <span class="attention">
                {#if attention.label}<span
                    class:trouble={attention.trouble}
                    class="attention-item"
                    title={attention.title}
                    ><IconWarning class="h-3 w-3 shrink-0" /><span
                      >{attention.label}</span
                    ></span
                  >{/if}
                {#if row.totals.retried}<span
                    class="attention-item"
                    style:color={getCategoryStrokeColor('retry')}
                    title={`${row.totals.retried} activities with observed retries · ${row.totals.recovered} completed after retrying. Counts activities, not retry attempts; history does not expose every internal retry.`}
                    ><IconRetry class="h-3 w-3 shrink-0" />{row.totals.retried} retried</span
                  >{/if}
                {#if !attention.label && !row.totals.retried}<span class="quiet"
                    >{row.run.status === 'Running'
                      ? 'Running'
                      : row.summary?.complete
                        ? row.run.status
                        : ''}</span
                  >{/if}
              </span>
              <span class="primitives" title={workLabel(row)}>
                {#each row.primitives as primitive (primitive.kind)}
                  {@const Icon = CategoryIcon[primitive.kind].Icon}
                  <span
                    class="primitive"
                    title={`${primitive.label}: ${primitive.counts.total} · ${summarySegments(
                      primitive.kind,
                      primitive.counts,
                    )
                      .map(
                        (segment) =>
                          `${segment.count} ${segment.label.toLowerCase()}`,
                      )
                      .join(', ')}`}
                  >
                    <span class="mark" aria-hidden="true"
                      ><span class="segments"
                        >{#each summarySegments(primitive.kind, primitive.counts) as segment (segment.label)}<span
                            style:width={`${(segment.count / primitive.counts.total) * 100}%`}
                            style:background={segment.color}
                          ></span>{/each}</span
                      ><Icon class="relative h-3 w-3 text-black" /></span
                    >
                    <span>{count.format(primitive.counts.total)}</span><span
                      class="sr-only"
                    >
                      {primitive.label}</span
                    >
                  </span>
                {/each}
                {#if !row.summary}<span class="coverage-label"
                    >Loading summary…</span
                  >{:else if !row.summary.complete}<span
                    class="coverage-label"
                    title="History is still loading; operation counts are lower bounds."
                    >Partial</span
                  >{:else if !row.totals.total}<span class="coverage-label"
                    >No recorded operations</span
                  >{/if}
              </span>
            </button>
          {/each}
        </div>
      </div>
      <div class="detail">
        <div
          class="panel-heading timeline-heading"
          data-testid="chain-focused-run"
          data-run-id={focused.runId}
        >
          <div class="focus-title">
            <span class="status-badge"
              ><WorkflowStatusBadge
                status={chainWorkflowStatus(focused.status)}
              /></span
            >
            <a
              class="run-id"
              href={routeForWorkflow({
                namespace,
                workflow: workflowId,
                run: focused.runId,
              })}
              title={focused.runId}
              aria-label={`Open run ${focused.runId}`}>{focused.runId}</a
            >
          </div>
        </div>
        {#if liveError && focused.status === 'Running'}<p
            class="live-notice"
            role="status"
            title={liveError}
          >
            Live state unavailable. {liveState?.runId === focused.runId
              ? `Last updated ${time(liveState.fetchedAt)}.`
              : 'Recorded history only.'}
          </p>{/if}
        <div
          role="region"
          aria-label="Selected run Timeline"
          data-testid="chain-detail"
        >
          {#key focused.runId}
            <RunChainTimeline
              run={focused}
              history={histories[focused.runId]}
              {liveState}
              {namespace}
              {workflowId}
            />
          {/key}
        </div>
        {#if historyErrors[focused.runId] || histories[focused.runId]?.hasMore}<div
            class="detail-notice"
          >
            <span
              >{historyErrors[focused.runId]
                ? 'History incomplete.'
                : 'More events are available.'}</span
            ><button
              disabled={loadingRuns.includes(focused.runId)}
              onclick={() => onloadmore(focused)}
              >{historyErrors[focused.runId]
                ? 'Retry'
                : 'Load more events'}</button
            >
          </div>{/if}
      </div>
    </div>
  {/if}
</div>

<style lang="postcss">
  .canvas {
    @apply flex min-h-0 flex-col;

    container-type: inline-size;
  }

  .workspace,
  .overview,
  .detail {
    @apply min-w-0;
  }

  .detail {
    @apply border-t border-primary;
  }

  .panel-heading {
    @apply flex min-w-0 flex-col justify-center gap-1 bg-surface-secondary px-3 text-xs;

    height: 60px;
    overflow: hidden;
  }

  .panel-heading strong {
    @apply truncate text-sm font-semibold;
  }

  .panel-heading small {
    @apply truncate text-xs text-secondary;
  }

  .overview-heading {
    @apply flex min-w-0 items-center justify-between gap-2;
  }

  .run-navigation {
    @apply flex shrink-0 gap-1;
  }

  .run-navigation button {
    @apply h-7 w-8 rounded border border-primary text-sm;
  }

  .run-navigation .follow-latest {
    @apply w-auto px-2 text-xs text-brand;
  }

  .run-list {
    @apply relative flex min-w-0 items-center overflow-x-auto px-3 py-3;

    overscroll-behavior-x: contain;
    scrollbar-width: thin;
  }

  .run-connector {
    @apply flex w-7 shrink-0 items-center justify-center text-tertiary;
  }

  .run-row {
    @apply relative grid shrink-0 gap-x-3 gap-y-1 rounded border border-primary bg-surface-primary p-2 text-left text-xs;

    width: 200px;
    height: 176px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-rows: 32px 40px 44px 30px;
  }

  .run-row.selected,
  .run-row.selected:hover {
    @apply border-tertiary bg-surface-tertiary;
  }

  .run-row.selected::after {
    @apply pointer-events-none absolute inset-0 rounded border border-tertiary;

    content: '';
  }

  .run-row.troubled {
    @apply border-l-2 border-l-danger;
  }

  .run-start {
    @apply flex min-w-0 flex-col gap-0.5;

    grid-column: 1 / -1;
  }

  .run-time {
    @apply truncate text-sm font-semibold tabular-nums;

    line-height: 18px;
  }

  .selected .run-time {
    @apply font-semibold;
  }

  .run-date {
    @apply flex items-center justify-between text-secondary;

    font-size: 10px;
    line-height: 12px;
  }

  .latest-label {
    @apply font-semibold text-primary;
  }

  .duration-metric,
  .work-metric {
    @apply flex min-w-0 flex-col gap-0.5;
  }

  .metric-caption {
    @apply flex items-center justify-between gap-1 text-secondary;

    font-size: 10px;
    line-height: 12px;
  }

  .metric-value {
    @apply flex min-w-0 items-baseline justify-between gap-0.5 tabular-nums;

    font-size: 13px;
    line-height: 18px;
    font-weight: 500;
  }

  .metric-value > span {
    @apply truncate;
  }

  .outlier {
    @apply font-semibold text-primary;

    font-size: 9px;
  }

  .live-label {
    @apply ml-1 text-secondary;

    font-size: 9px;
  }

  .metric-track {
    @apply block w-full overflow-hidden rounded-sm bg-surface-secondary;

    height: 4px;
  }

  .duration-fill {
    @apply block h-full bg-content-secondary;

    min-width: 2px;
  }

  .work-fill {
    @apply flex h-full;
  }

  .work-fill > span {
    @apply h-full;
  }

  .primitives {
    @apply grid min-w-0 grid-cols-4 content-center items-center gap-1 overflow-hidden;

    grid-column: 1 / -1;
    grid-row: 3;
  }

  .primitive {
    @apply flex shrink-0 items-center gap-0.5 font-medium tabular-nums;

    font-size: 11px;
  }

  .mark {
    @apply relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-primary;
  }

  .segments {
    @apply absolute inset-0 flex;
  }

  .coverage-label {
    @apply truncate text-secondary;

    font-size: 10px;
  }

  .attention {
    @apply flex min-w-0 flex-col justify-center border-t border-primary pt-1;

    line-height: 12px;
    grid-column: 1 / -1;
    grid-row: 4;
    font-size: 10px;
  }

  .attention-item {
    @apply flex min-w-0 items-center gap-1 text-secondary;

    white-space: nowrap;
  }

  .attention-item > span {
    @apply truncate;
  }

  .attention-item.trouble {
    @apply text-danger;
  }

  .quiet {
    @apply text-secondary;
  }

  .focus-title {
    @apply flex min-w-0 items-center gap-2;

    white-space: nowrap;
  }

  .status-badge {
    @apply shrink-0;
  }

  .run-id {
    @apply min-w-0 truncate text-xs text-primary;
  }

  .timeline-heading {
    @apply border-b border-primary;

    height: 44px;
  }

  .live-notice {
    @apply truncate border-b border-primary px-3 py-2 text-xs text-warning;
  }

  .detail-notice {
    @apply flex items-center justify-between border-t border-primary px-3 text-xs text-secondary;
  }

  .detail-notice button {
    @apply min-h-8 text-brand;
  }

  button:disabled {
    @apply cursor-default opacity-50;
  }

  button:hover {
    @apply bg-surface-tertiary;
  }

  button:focus-visible,
  a:focus-visible {
    @apply relative z-20 outline outline-2 -outline-offset-2 outline-interactive-primary;
  }

  @media (pointer: coarse) {
    .run-navigation button {
      min-height: 44px;
    }
  }
</style>
