<script lang="ts">
  import { translate } from '$lib/i18n/translate';
  import { IconArrowUpRight } from '$lib/io/icon';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import type { TimelineGutterTiming } from './gutter/timeline-gutter-cells';
  import type {
    TimelineChildOutcome,
    TimelineChildSummary,
  } from './timeline-child-summary';

  type Props = {
    summary: TimelineChildSummary;
    /** Where open-ended timings run to: now, while the workflow is live. */
    nowMs: number;
    workflowHref?: string;
    onSelect: (timelineKey: string) => void;
  };

  const { summary, nowMs, workflowHref, onSelect }: Props = $props();

  // A long child would turn the panel into a second timeline; past this the
  // tree is the better place to browse it.
  const ITEM_LIMIT = 50;

  const durationText = (timing: TimelineGutterTiming | undefined) =>
    timing
      ? formatDistanceAbbreviated({
          start: new Date(timing.startTimeMs),
          end: new Date(
            Math.max(timing.endTimeMs ?? nowMs, timing.startTimeMs),
          ),
          includeMillisecondsForUnderSecond: true,
        }) || '0ms'
      : '';

  const OUTCOME_COLORS: Record<TimelineChildOutcome, string> = {
    completed: 'var(--color-content-static-success)',
    failed: 'var(--color-content-static-danger)',
    canceled: 'var(--color-content-static-warning)',
    running: 'var(--color-content-brand)',
    other: 'var(--color-content-tertiary)',
  };

  const visibleRuns = $derived.by(() => {
    let remaining = ITEM_LIMIT;
    return summary.runs.map((run) => {
      const items = run.items.slice(0, Math.max(0, remaining));
      remaining -= items.length;
      return { ...run, items };
    });
  });
  const hiddenCount = $derived(
    summary.runs.reduce((count, run) => count + run.items.length, 0) -
      visibleRuns.reduce((count, run) => count + run.items.length, 0),
  );
</script>

<section
  class="flex flex-col gap-3 border-b border-primary p-4"
  data-testid="timeline-child-summary"
>
  <div class="flex items-center justify-between gap-2">
    <h3
      class="min-w-0 truncate text-xs font-medium text-secondary"
      title={summary.workflowId}
    >
      {summary.workflowId}
    </h3>
    {#if workflowHref}
      <a
        href={workflowHref}
        class="flex items-center gap-0.5 rounded text-xs text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
      >
        {translate('workflows.timeline-open-workflow')}
        <IconArrowUpRight class="size-3" />
      </a>
    {/if}
  </div>

  <!-- Status is left to the panel's header, which already shows it. -->
  <dl class="grid auto-cols-fr grid-flow-col gap-x-4 gap-y-3">
    <div class="flex flex-col">
      <dt class="text-xs text-secondary">{translate('common.duration')}</dt>
      <dd class="font-mono text-sm tabular-nums">
        {durationText(summary.timing)}
      </dd>
    </div>
    <div class="flex flex-col">
      <dt class="text-xs text-secondary">
        {translate('workflows.timeline-runs')}
      </dt>
      <dd class="text-sm">{summary.runs.length}</dd>
    </div>
    <div class="flex flex-col">
      <dt class="text-xs text-secondary">
        {translate('workflows.timeline-activities')}
      </dt>
      <dd class="text-sm">
        {summary.activities.total}
        {#if summary.activities.failed}
          <span class="text-secondary">·</span>
          {translate('workflows.timeline-activities-failed', {
            count: summary.activities.failed,
          })}
        {/if}
        {#if summary.activities.retried}
          <span class="text-secondary">·</span>
          {translate('workflows.timeline-activities-retried', {
            count: summary.activities.retried,
          })}
        {/if}
      </dd>
    </div>
    {#if summary.childWorkflows}
      <!-- With the activities, this adds up to the count on the tree row. -->
      <div class="flex flex-col">
        <dt class="text-xs text-secondary">
          {translate('workflows.timeline-child-workflows')}
        </dt>
        <dd class="text-sm">{summary.childWorkflows}</dd>
      </div>
    {/if}
  </dl>

  <div class="flex flex-col">
    {#each visibleRuns as run (run.runId)}
      {#if run.label && run.items.length}
        <p class="px-2 pb-1 pt-2 text-xs text-secondary">{run.label}</p>
      {/if}
      <ul class="flex flex-col">
        {#each run.items as item (item.timelineKey)}
          <li>
            {#if item.selectable}
              <button
                type="button"
                class="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-interactive-secondary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
                onclick={() => onSelect(item.timelineKey)}
              >
                {@render itemBody(item)}
              </button>
            {:else}
              <div
                class="flex items-center gap-2 px-2 py-1 text-sm opacity-60"
                title={translate('workflows.timeline-expand-to-select')}
              >
                {@render itemBody(item)}
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    {/each}
    {#if hiddenCount > 0}
      <p class="px-2 pt-1 text-xs text-secondary">
        {translate('workflows.timeline-more-in-tree', { count: hiddenCount })}
      </p>
    {/if}
  </div>
</section>

{#snippet itemBody(item: TimelineChildSummary['runs'][number]['items'][number])}
  <span
    class="size-2 shrink-0 rounded-full"
    style:background={OUTCOME_COLORS[item.outcome]}
    aria-hidden="true"
  ></span>
  <span class="min-w-0 flex-1 truncate">{item.label}</span>
  {#if item.attempt}
    <span
      class="shrink-0 font-mono text-xs tabular-nums text-secondary"
      title="{translate('workflows.attempt')} {item.attempt}"
      >{item.attempt}x</span
    >
  {/if}
  <span
    class="w-16 shrink-0 text-right font-mono text-xs tabular-nums text-secondary"
    >{durationText(item.timing)}</span
  >
{/snippet}
