<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import RunCounts from '$lib/components/run-counts/run-counts.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconWarning } from '$lib/io/icon';
  import { countRunGroups } from '$lib/models/event-history/run-counts';
  import { isWorkflowOpen } from '$lib/models/workflow-status';
  import type { WorkflowHistoryController } from '$lib/services/workflow-history-controller.svelte';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { routeForWorkflow } from '$lib/utilities/route-for';
  import { getWorkflowLatestTime } from '$lib/utilities/workflow-time-skipping';

  import type { CardLoad, ChainRun, RunCardSummary } from '../../types';
  import type { Transition } from '../transitions';
  import { buildRunBar } from './run-bar';
  import {
    partialSuffix,
    runCardDescription,
    type RunCardLoadState,
    type RunCardMode,
    runCardName,
  } from './run-card-labels';

  import RunCardActions from './run-card-actions.svelte';
  import RunCardBar from './run-card-bar.svelte';
  import RunCardHead from './run-card-head.svelte';

  interface Props {
    run: ChainRun;
    namespace: string;
    controller: WorkflowHistoryController | undefined;
    summary: RunCardSummary | undefined;
    cardLoad: CardLoad;
    transition: Transition | null;
    width: number;
    now: number;
    selected: boolean;
    isLatest: boolean;
    live: boolean;
    stale: boolean;
    tabIndex: 0 | -1;
    buttonElement?: HTMLButtonElement | null;
    onSelect: () => void;
    onRetry: () => void;
    onRetryStatus: () => void;
  }

  let {
    run,
    namespace,
    controller,
    summary,
    cardLoad,
    transition,
    width,
    now,
    selected,
    isLatest,
    live,
    stale,
    tabIndex,
    buttonElement = $bindable(),
    onSelect,
    onRetry,
    onRetryStatus,
  }: Props = $props();

  const descriptionId = $props.id();

  const workflow = $derived(run.workflow);
  const open = $derived(isWorkflowOpen(workflow));
  const showsLive = $derived(
    isLatest && live && open && !stale && cardLoad.status !== 'error',
  );
  const mode = $derived.by((): RunCardMode | null => {
    if (stale) {
      return 'stale';
    }
    if (!isLatest) {
      return null;
    }
    return showsLive ? 'live' : 'latest';
  });
  const duration = $derived(
    formatDistanceAbbreviated({
      start: workflow.startTime,
      end: getWorkflowLatestTime(workflow, now),
    }) || '0s',
  );

  const eventGroups = $derived(
    controller?.history.lazyGroupsWithoutWorkflowTasks ?? [],
  );
  const shownSummary = $derived(
    controller?.fetchComplete ? undefined : summary,
  );
  const loadState = $derived.by((): RunCardLoadState => {
    if (cardLoad.status === 'error') {
      return 'error';
    }
    if (controller?.fetchComplete || shownSummary) {
      return 'complete';
    }
    if (eventGroups.length > 0) {
      return 'partial';
    }
    return 'loading';
  });
  const counts = $derived(shownSummary?.counts ?? countRunGroups(eventGroups));
  const barSegments = $derived(
    buildRunBar(shownSummary?.barGroups ?? eventGroups, width),
  );
  const loadedFraction = $derived.by(() => {
    if (loadState !== 'partial' || !controller) {
      return 1;
    }
    const expectedEventCount =
      controller.totalExpectedEvents || Number(workflow.historyEvents) || 0;
    if (expectedEventCount <= 0) {
      return 1;
    }
    return Math.min(1, controller.history.eventCount / expectedEventCount);
  });

  const accessibleName = $derived(
    runCardName({
      runId: run.runId,
      status: workflow.status,
      mode,
      duration,
    }),
  );
  const accessibleDescription = $derived(
    runCardDescription({ runId: run.runId, counts, loadState, transition }),
  );

  const runHref = $derived(
    routeForWorkflow({ namespace, workflow: workflow.id, run: run.runId }),
  );
</script>

<div
  class="group/run relative flex shrink-0 transition-[width] duration-300 motion-reduce:transition-none"
  style:width="{width}px"
  data-testid="run-card"
  data-run-id={run.runId}
>
  <button
    bind:this={buttonElement}
    type="button"
    tabindex={tabIndex}
    aria-current={selected ? 'true' : undefined}
    aria-label={accessibleName}
    aria-describedby={descriptionId}
    onclick={onSelect}
    class={twMerge(
      'flex w-full flex-col gap-2 overflow-hidden rounded-md border border-secondary bg-surface-secondary p-2 text-left shadow-sm transition-shadow hover:shadow-md',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary-press',
      selected &&
        'bg-interactive-secondary-press outline outline-2 outline-offset-2 outline-interactive-primary',
    )}
  >
    <RunCardHead
      runId={run.runId}
      {duration}
      status={workflow.status}
      {open}
      live={showsLive}
      {stale}
    />

    {#if loadState === 'loading'}
      <Skeleton class="h-1.5 w-full rounded-full" />
      <span class="flex items-center gap-2">
        <Skeleton class="h-3.5 w-8" />
        <Skeleton class="h-3.5 w-8" />
        <Skeleton class="h-3.5 w-6" />
      </span>
    {:else if loadState === 'error'}
      <span class="h-1.5 w-full rounded-full border border-dashed border-danger"
      ></span>
      <span class="flex min-h-6 items-center gap-1 text-xs text-danger">
        <IconWarning />{translate('workflows.couldnt-load-events')}
      </span>
    {:else}
      <RunCardBar segments={barSegments} {loadedFraction} />
      <RunCounts {counts} suffix={partialSuffix(loadState)} />
    {/if}
  </button>
  <span id={descriptionId} class="sr-only">{accessibleDescription}</span>

  <RunCardActions
    runId={run.runId}
    {runHref}
    {tabIndex}
    canRetry={cardLoad.status === 'error' && cardLoad.retryable}
    {onRetry}
    canRetryStatus={stale}
    {onRetryStatus}
  />
</div>
