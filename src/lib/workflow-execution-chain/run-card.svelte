<script lang="ts">
  import { twJoin, twMerge } from 'tailwind-merge';

  import { getCategoryStrokeColor } from '$lib/components/lines-and-dots/colors';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import type { I18nKey } from '$lib/i18n';
  import { translate } from '$lib/i18n/translate';
  import { BadgeStatus } from '$lib/io/badge-status';
  import {
    IconArrowUpRight,
    IconCheckCircleSolid,
    IconCheckmark,
    type IconComponent,
    IconCopy,
    IconTemporalActivity,
    IconTemporalChildWorkflow,
    IconTemporalNexus,
    IconTemporalSignal,
    IconTemporalTimer,
    IconTemporalUpdate,
    IconWarning,
    IconXmarkCircleSolid,
  } from '$lib/io/icon';
  import type { WorkflowHistoryController } from '$lib/services/workflow-history-controller.svelte';
  import type { EventTypeCategory } from '$lib/types/events';
  import type { WorkflowStatus } from '$lib/types/workflows';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { routeForWorkflow } from '$lib/utilities/route-for';
  import { getWorkflowLatestTime } from '$lib/utilities/workflow-time-skipping';

  import { buildRunBar } from './run-bar';
  import { countRunGroups, type RunCounts } from './run-counts';
  import type { Transition } from './transitions';
  import type { CardLoad, ChainRun } from './types';

  interface Props {
    run: ChainRun;
    namespace: string;
    controller: WorkflowHistoryController | undefined;
    cardLoad: CardLoad;
    transition: Transition | null;
    width: number;
    now: number;
    selected: boolean;
    isLatest: boolean;
    live: boolean;
    tabIndex: 0 | -1;
    buttonElement?: HTMLButtonElement | null;
    onSelect: () => void;
    onRetry: () => void;
  }

  let {
    run,
    namespace,
    controller,
    cardLoad,
    transition,
    width,
    now,
    selected,
    isLatest,
    live,
    tabIndex,
    buttonElement = $bindable(),
    onSelect,
    onRetry,
  }: Props = $props();

  const descriptionId = $props.id();

  type CountKey = Exclude<keyof RunCounts, 'failed' | 'retried'>;

  const COUNT_DISPLAY: {
    key: CountKey;
    Icon: IconComponent;
    label: I18nKey;
    category: EventTypeCategory;
  }[] = [
    {
      key: 'activities',
      Icon: IconTemporalActivity,
      label: 'workflows.run-count-activities',
      category: 'activity',
    },
    {
      key: 'childWorkflows',
      Icon: IconTemporalChildWorkflow,
      label: 'workflows.run-count-child-workflows',
      category: 'child-workflow',
    },
    {
      key: 'timers',
      Icon: IconTemporalTimer,
      label: 'workflows.run-count-timers',
      category: 'timer',
    },
    {
      key: 'signals',
      Icon: IconTemporalSignal,
      label: 'workflows.run-count-signals',
      category: 'signal',
    },
    {
      key: 'nexusOperations',
      Icon: IconTemporalNexus,
      label: 'workflows.run-count-nexus-operations',
      category: 'nexus',
    },
    {
      key: 'updates',
      Icon: IconTemporalUpdate,
      label: 'workflows.run-count-updates',
      category: 'update',
    },
  ];

  const STATUS_LABELS: Record<NonNullable<WorkflowStatus>, I18nKey> = {
    Running: 'workflows.running',
    Paused: 'workflows.paused',
    Completed: 'workflows.completed',
    ContinuedAsNew: 'workflows.continued-as-new',
    Failed: 'workflows.failed',
    TimedOut: 'workflows.timed-out',
    Terminated: 'workflows.terminated',
    Canceled: 'workflows.canceled',
  };

  const TRANSITION_DESCRIPTIONS: Record<Transition, I18nKey> = {
    continuedAsNew: 'workflows.transition-continued-as-new-description',
    retry: 'workflows.transition-retry-description',
    cron: 'workflows.transition-cron-description',
  };

  const SUCCESS_STATUSES: WorkflowStatus[] = ['Completed', 'ContinuedAsNew'];

  const { copy, copied } = copyToClipboard();

  const workflow = $derived(run.workflow);
  const isOpen = $derived(workflow.isRunning);
  const isLive = $derived(isLatest && live && isOpen);
  const duration = $derived(
    formatDistanceAbbreviated({
      start: workflow.startTime,
      end: getWorkflowLatestTime(workflow, now),
    }) || '0s',
  );

  const groups = $derived(
    controller?.history.lazyGroupsWithoutWorkflowTasks ?? [],
  );
  const loadState = $derived.by(() => {
    if (cardLoad.status === 'error') {
      return 'error';
    }
    if (controller?.fetchComplete) {
      return 'complete';
    }
    if (groups.length > 0) {
      return 'partial';
    }
    return 'loading';
  });
  const suffix = $derived(loadState === 'partial' ? '+' : '');
  const counts = $derived(countRunGroups(groups));
  const visibleCounts = $derived(
    COUNT_DISPLAY.filter(({ key }) => counts[key] > 0),
  );
  const segments = $derived(buildRunBar(groups, width));
  const loadedFraction = $derived.by(() => {
    if (loadState !== 'partial' || !controller) {
      return 1;
    }
    const expected =
      controller.totalExpectedEvents || Number(workflow.historyEvents) || 0;
    if (expected <= 0) {
      return 1;
    }
    return Math.min(1, controller.history.eventCount / expected);
  });

  const statusLabel = $derived(
    workflow.status ? translate(STATUS_LABELS[workflow.status]) : '',
  );
  const modeLabel = $derived.by(() => {
    if (!isLatest) {
      return '';
    }
    return isLive
      ? translate('workflows.live').toLowerCase()
      : translate('workflows.latest').toLowerCase();
  });
  const accessibleName = $derived(
    modeLabel
      ? translate('workflows.run-card-name-with-mode', {
          shortId: run.runId.slice(0, 8),
          status: statusLabel,
          mode: modeLabel,
          duration,
        })
      : translate('workflows.run-card-name', {
          shortId: run.runId.slice(0, 8),
          status: statusLabel,
          duration,
        }),
  );

  const description = $derived.by(() => {
    const parts = [run.runId];
    for (const { key, label } of visibleCounts) {
      parts.push(translate(label, { count: counts[key] }) + suffix);
    }
    if (counts.failed) {
      parts.push(
        translate('workflows.run-count-failed', {
          count: counts.failed,
          suffix,
        }),
      );
    }
    if (counts.retried) {
      parts.push(
        translate('workflows.run-count-retried', {
          count: counts.retried,
          suffix,
        }),
      );
    }
    if (loadState === 'partial') {
      parts.push(translate('workflows.run-card-still-loading'));
    }
    if (loadState === 'loading') {
      parts.push(translate('workflows.run-card-loading-events'));
    }
    if (loadState === 'error') {
      parts.push(translate('workflows.run-card-load-failed'));
    }
    parts.push(
      translate(
        transition
          ? TRANSITION_DESCRIPTIONS[transition]
          : 'workflows.start-of-chain',
      ),
    );
    return parts.join(', ');
  });

  const runHref = $derived(
    routeForWorkflow({
      namespace,
      workflow: workflow.id,
      run: run.runId,
    }),
  );

  const actionClasses = twJoin(
    'flex size-6 items-center justify-center rounded text-sm text-secondary',
    'hover:bg-interactive-secondary-hover hover:text-primary',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary-press',
  );
</script>

<div
  class="group/run relative flex shrink-0"
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
    <span class="flex min-w-0 items-center gap-2 text-xs">
      <span class="flex min-w-0 items-baseline gap-1 font-mono tabular-nums">
        <span class="truncate text-primary">{run.runId}</span>
        <span class="shrink-0 text-tertiary">·</span>
        <span class="shrink-0 text-secondary">{duration}</span>
      </span>
      <span
        class="ml-auto flex shrink-0 transition-opacity group-focus-within/run:opacity-0 group-hover/run:opacity-0"
      >
        {#if isOpen}
          <BadgeStatus
            status="Running"
            size="sm"
            extensions={[
              isLive
                ? {
                    text: translate('workflows.live'),
                    colorScheme: 'success',
                  }
                : {
                    text: translate('workflows.latest'),
                    colorScheme: 'neutral',
                  },
            ]}
          />
        {:else if SUCCESS_STATUSES.includes(workflow.status)}
          <IconCheckCircleSolid class="text-[15px] text-static-success" />
        {:else}
          <IconXmarkCircleSolid class="text-[15px] text-static-danger" />
        {/if}
      </span>
    </span>

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
      <span class="flex h-1.5 w-full overflow-hidden rounded-full">
        <span class="flex h-full gap-px" style:width="{loadedFraction * 100}%">
          {#each segments as segment, index (index)}
            <span
              class="h-full min-w-px flex-1"
              style:background-color={segment.color}
              style:opacity={segment.opacity}
            ></span>
          {/each}
        </span>
        {#if loadedFraction < 1}
          <span
            class="h-full flex-1 bg-surface-tertiary motion-safe:animate-pulse"
          ></span>
        {/if}
      </span>
      <span
        class="flex min-w-0 items-center gap-2 text-xs tabular-nums text-secondary"
      >
        {#each visibleCounts as { key, Icon, category } (key)}
          <span class="flex items-center gap-0.5">
            <span
              class="flex text-sm"
              style:color={getCategoryStrokeColor(category)}><Icon /></span
            >{counts[key]}{suffix}
          </span>
        {/each}
        {#if counts.failed || counts.retried}
          <span
            class="ml-auto flex shrink-0 items-center gap-2 pl-2 font-medium"
          >
            {#if counts.failed}
              <span class="text-static-danger">
                {translate('workflows.run-count-failed', {
                  count: counts.failed,
                  suffix,
                })}
              </span>
            {/if}
            {#if counts.retried}
              <span class="text-static-warning">
                {translate('workflows.run-count-retried', {
                  count: counts.retried,
                  suffix,
                })}
              </span>
            {/if}
          </span>
        {/if}
      </span>
    {/if}
  </button>
  <span id={descriptionId} class="sr-only">{description}</span>

  <div
    class="pointer-events-none absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-md border border-secondary bg-surface-primary p-0.5 opacity-0 shadow-sm transition-opacity group-focus-within/run:pointer-events-auto group-focus-within/run:opacity-100 group-hover/run:pointer-events-auto group-hover/run:opacity-100"
  >
    <button
      type="button"
      tabindex={tabIndex}
      class={actionClasses}
      aria-label={translate('workflows.copy-run-id')}
      title={$copied
        ? translate('common.copied')
        : translate('workflows.copy-run-id')}
      onclick={(event) => copy(event, run.runId)}
    >
      {#if $copied}
        <IconCheckmark class="text-static-success" />
      {:else}
        <IconCopy />
      {/if}
    </button>
    <a
      href={runHref}
      tabindex={tabIndex}
      class={actionClasses}
      aria-label={translate('workflows.go-to-run-page')}
      title={translate('workflows.go-to-run-page')}
    >
      <IconArrowUpRight />
    </a>
  </div>
  {#if cardLoad.status === 'error' && cardLoad.retryable}
    <button
      type="button"
      tabindex={tabIndex}
      class={twMerge(
        actionClasses,
        'absolute bottom-2 right-2 h-6 w-auto px-1.5 text-xs text-danger underline',
      )}
      onclick={onRetry}
    >
      {translate('common.retry')}
    </button>
  {/if}
</div>
