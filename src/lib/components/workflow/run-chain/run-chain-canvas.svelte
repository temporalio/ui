<script lang="ts">
  import { tick, untrack } from 'svelte';

  import { getCategoryStrokeColor } from '$lib/components/lines-and-dots/colors';
  import { timestamp } from '$lib/components/timestamp.svelte';
  import WorkflowStatusBadge from '$lib/components/workflow/workflow-status-badge.svelte';
  import { IconClock, IconRetry, IconWarning } from '$lib/io/icon';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { routeForWorkflow } from '$lib/utilities/route-for';

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
  import {
    flowConnectors,
    flowLayers,
    flowThickness,
  } from './run-chain-visual';

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
  const runDuration = (run: ChainRun) =>
    formatDistanceAbbreviated({
      start: run.startTime,
      end: run.closeTime ?? now,
      includeMilliseconds: true,
    }) || formatChainDuration(duration(run));
  function runLabel(run: ChainRun) {
    return `Started ${$timestamp(run.startTime, { relative: false })} · ${run.closeTime ? 'Duration' : 'Elapsed'} ${runDuration(run)} · ${run.status} · ${run.runId}`;
  }
  const flows = $derived(
    comparison.rows.map((row) =>
      flowLayers(
        row.primitives,
        flowThickness(row.totals.total, comparison.maxWork),
      ),
    ),
  );
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
                ><svg
                  class="flow-bridge"
                  viewBox="0 0 1 1"
                  preserveAspectRatio="none"
                  ><line x1="0" y1="0.5" x2="1" y2="0.5"
                  ></line>{#each flowConnectors(flows[index - 1], flows[index]) as connector (connector.kind)}<path
                      d={connector.path}
                      fill={getCategoryStrokeColor(connector.kind)}
                    ></path>{/each}</svg
                ></span
              >{/if}
            <button
              class="run-row"
              class:selected={row.run.runId === focused.runId}
              onclick={() => select(row.run)}
              aria-pressed={row.run.runId === focused.runId}
              aria-label={`${runLabel(row.run)}. ${row.summary ? workLabel(row) || 'No recorded work' : 'Loading summary'}. ${attention.title}. ${row.totals.retried ? `${row.totals.retried} activities retried.` : ''}${!row.summary?.complete ? ' Partial history.' : ''}`}
              data-run-id={row.run.runId}
              data-testid="chain-comparison-row"
            >
              <span class="run-heading">
                <span class="run-start" title={runLabel(row.run)}
                  >{$timestamp(row.run.startTime)}</span
                >
                <span
                  class="run-duration"
                  title={`${row.run.closeTime === undefined ? 'Elapsed so far' : 'Duration'}: ${runDuration(row.run)}${comparison.durationMedian !== undefined ? ` · Median of displayed closed runs: ${formatChainDuration(comparison.durationMedian)}` : ''}${row.longer ? ' · At least 1.5× the median duration' : ''}`}
                >
                  <span class="duration-value" class:longer={row.longer}
                    ><IconClock class="h-3 w-3 shrink-0" /><span
                      >{runDuration(row.run)}</span
                    >{#if row.run.closeTime === undefined}<span
                        class="live-label">live</span
                      >{/if}</span
                  >
                  <span class="tags"
                    >{#if row.run.runId === latest?.runId}<span
                        class="latest-label"
                        >{hasLater ? 'Newest loaded' : 'Latest'}</span
                      >{/if}</span
                  >
                </span>
              </span>
              <span
                class="flow"
                class:partial={!row.summary?.complete}
                class:open={row.run.closeTime === undefined}
                class:origin={row.run.runId === runs[0]?.runId && !hasEarlier}
                class:ended={index === comparison.rows.length - 1 &&
                  row.run.closeTime !== undefined &&
                  row.run.status !== 'Continued as new'}
                title={`${row.summary ? `${!row.summary.complete ? 'At least ' : ''}${row.totals.total} recorded operations${workLabel(row) ? ` · ${workLabel(row)}` : ''}` : 'Loading summary'}${row.heavier ? ' · At least 1.5× the median recorded operations of the displayed complete, closed runs' : ''}. Band thickness is relative to the busiest displayed run.`}
                aria-hidden="true"
                ><span class="flow-spine"
                ></span>{#each flows[index] as layer (layer.kind)}<span
                    class="flow-layer"
                    style:top={`${layer.top * 100}%`}
                    style:height={`${layer.height * 100}%`}
                    style:background={getCategoryStrokeColor(layer.kind)}
                  ></span>{/each}</span
              >
              <span class="attention">
                {#if attention.trouble}<span
                    class="attention-item trouble"
                    title={attention.title}
                    ><IconWarning class="h-3 w-3 shrink-0" /><span
                      >{attention.label}</span
                    ></span
                  >{/if}
                {#if row.totals.retried}<span
                    class="attention-item"
                    style:color={getCategoryStrokeColor('retry')}
                    title={`${row.totals.retried} activities with observed retries · ${row.totals.recovered} completed after retrying. Counts activities, not retry attempts; history does not expose every internal retry.`}
                    ><IconRetry class="h-3 w-3 shrink-0" /><span
                      >{row.totals.retried} retried</span
                    ></span
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

    --card-h: 130px;
    --flow-top: 50px;
    --flow-h: 40px;
  }

  .run-connector {
    @apply relative w-7 shrink-0 text-tertiary;

    height: var(--card-h);
  }

  .flow-bridge {
    @apply absolute inset-x-0 w-full overflow-visible;

    top: calc(var(--flow-top) + 1px);
    height: var(--flow-h);
  }

  .flow-bridge line {
    stroke: currentColor;
    stroke-width: 1px;
    opacity: 0.4;
    vector-effect: non-scaling-stroke;
  }

  .flow-bridge path {
    opacity: 0.55;
  }

  .run-row {
    @apply relative grid shrink-0 gap-y-1.5 rounded border border-transparent bg-transparent p-2 text-left text-xs;

    width: 232px;
    height: var(--card-h);
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: 36px var(--flow-h) 24px;
  }

  .run-row:hover {
    @apply border-primary bg-transparent;
  }

  .run-row.selected,
  .run-row.selected:hover {
    @apply border-tertiary bg-surface-tertiary;
  }

  .run-row.selected::after {
    @apply pointer-events-none absolute inset-0 z-10 rounded border border-tertiary;

    content: '';
  }

  .run-heading {
    @apply flex min-w-0 flex-col gap-0.5;
  }

  .run-start {
    @apply self-center truncate font-medium tabular-nums;
  }

  .run-duration {
    @apply flex min-w-0 items-center justify-between gap-2 tabular-nums;
  }

  .duration-value {
    @apply flex min-w-0 items-center gap-1;
  }

  .duration-value > span:first-of-type {
    @apply truncate;
  }

  .duration-value.longer {
    @apply text-danger;
  }

  .tags {
    @apply flex shrink-0 items-center gap-1.5;
  }

  .latest-label {
    @apply font-semibold text-primary;

    font-size: 10px;
  }

  .live-label {
    @apply text-secondary;

    font-size: 9px;
  }

  .flow {
    @apply absolute text-tertiary;

    top: var(--flow-top);
    left: -1px;
    right: -1px;
    height: var(--flow-h);
  }

  .flow.origin {
    @apply left-2 overflow-hidden rounded-l-sm;
  }

  .flow.ended {
    @apply right-2 overflow-hidden rounded-r-sm;
  }

  .flow.open {
    mask-image: linear-gradient(to right, black 65%, transparent);
  }

  .flow.partial .flow-layer {
    opacity: 0.6;
  }

  .flow-spine {
    @apply absolute inset-x-0 block bg-current opacity-40;

    top: 50%;
    height: 1px;
  }

  .flow-layer {
    @apply absolute inset-x-0 block;
  }

  .attention {
    @apply flex min-w-0 items-center gap-3;

    line-height: 12px;
    grid-row: 3;
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
