<script lang="ts">
  import { page } from '$app/state';

  import EventHistoryLegend from '$lib/components/lines-and-dots/event-history-legend.svelte';
  import RunCounts from '$lib/components/run-counts/run-counts.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { ButtonLink } from '$lib/io/button';
  import {
    IconArrowRight,
    IconArrowRightToLine,
    IconChevronLeft,
    IconChevronRight,
  } from '$lib/io/icon';
  import { countRunGroups } from '$lib/models/event-history/run-counts';
  import { isWorkflowOpen } from '$lib/models/workflow-status';
  import { createWallClock } from '$lib/runes/wall-clock.svelte';
  import { getWorkflowHistoryController } from '$lib/services/workflow-history-controller.svelte.js';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { getSharedFilterParams } from '$lib/utilities/event-filter-params';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import {
    belongsToCurrentChain,
    latestRunOfThisChain,
    readSuccessorRunId,
  } from '$lib/utilities/get-workflow-relationships';
  import {
    routeForTimeline,
    routeForWorkflowExecutionChain,
  } from '$lib/utilities/route-for';
  import { getWorkflowLatestTime } from '$lib/utilities/workflow-time-skipping';

  import RunNavigation, {
    type RunNavigationLink,
  } from './run-navigation.svelte';

  interface Props {
    namespace: string;
    workflow: WorkflowExecution;
  }

  let { namespace, workflow }: Props = $props();

  const historyController = getWorkflowHistoryController();
  const clock = createWallClock();

  const isOpen = $derived(isWorkflowOpen(workflow));
  const startedAttributes = $derived(
    historyController.history.initialEvent?.attributes,
  );
  const firstRunId = $derived(
    startedAttributes?.firstExecutionRunId || undefined,
  );
  const previousRunId = $derived(
    startedAttributes?.continuedExecutionRunId || undefined,
  );
  const nextRunId = $derived(
    historyController.closeEvent
      ? readSuccessorRunId(historyController.closeEvent)
      : undefined,
  );
  const isMultiRunChain = $derived(
    (!!firstRunId && firstRunId !== workflow.runId) || !!nextRunId,
  );

  const duration = $derived(
    formatDistanceAbbreviated({
      start: workflow.startTime,
      end: getWorkflowLatestTime(workflow, isOpen ? clock() : undefined),
    }) || '0s',
  );

  const eventGroups = $derived(
    historyController.history.lazyGroupsWithoutWorkflowTasks,
  );
  const counts = $derived(countRunGroups(eventGroups));
  const countSuffix = $derived(
    historyController.fetchComplete || eventGroups.length === 0 ? '' : '+',
  );

  const timelineHref = (runId: string) =>
    routeForTimeline({
      namespace,
      workflow: workflow.id,
      run: runId,
      queryParams: getSharedFilterParams(page.url),
    });

  const latestRun = $derived(
    latestRunOfThisChain({
      runId: workflow.runId,
      firstRunId,
      nextRunId,
      isOpen,
      currentRun: $workflowRun.currentRun,
    }),
  );

  const navigationLinks = $derived.by(() => {
    const links: RunNavigationLink[] = [];
    if (previousRunId) {
      links.push({
        id: 'previous',
        label: translate('workflows.previous-run'),
        href: timelineHref(previousRunId),
        LeadingIcon: IconChevronLeft,
      });
    }
    if (nextRunId) {
      links.push({
        id: 'next',
        label: translate('workflows.next-run'),
        href: timelineHref(nextRunId),
        TrailingIcon: IconChevronRight,
      });
    }
    if (latestRun.kind === 'run') {
      links.push({
        id: 'latest',
        label: translate('workflows.latest-run-button'),
        href: timelineHref(latestRun.runId),
        TrailingIcon: IconArrowRightToLine,
      });
    }
    return links;
  });

  const chainLinkDisabled = $derived(
    !belongsToCurrentChain({
      firstRunId,
      currentRun: $workflowRun.currentRun,
    }),
  );
</script>

<div class="flex flex-col gap-1" data-testid="run-timeline-heading">
  <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
    <div class="flex items-center gap-2">
      <h2 class="break-all text-2xl">
        {translate('workflows.run-heading', { runId: workflow.runId })}
      </h2>
      <EventHistoryLegend />
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <RunNavigation links={navigationLinks} />
      {#if isMultiRunChain && firstRunId}
        {#if chainLinkDisabled}
          <Tooltip
            text={translate('workflows.newer-chain-tooltip')}
            bottomRight
            class="flex"
          >
            <ButtonLink
              colorScheme="tertiary"
              size="sm"
              role="link"
              aria-disabled="true"
              tabindex={0}
              TrailingIcon={IconArrowRight}
              class="cursor-not-allowed opacity-disabled"
              data-testid="view-execution-chain"
            >
              {translate('workflows.view-execution-chain')}
            </ButtonLink>
          </Tooltip>
        {:else}
          <ButtonLink
            colorScheme="tertiary"
            size="sm"
            href={routeForWorkflowExecutionChain({
              namespace,
              workflow: workflow.id,
              firstRunId,
            })}
            TrailingIcon={IconArrowRight}
            data-testid="view-execution-chain"
          >
            {translate('workflows.view-execution-chain')}
          </ButtonLink>
        {/if}
      {/if}
    </div>
  </div>
  <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm tabular-nums">
    <span>{duration}</span>
    {#if eventGroups.length > 0}
      <span aria-hidden="true" class="h-4 border-l border-secondary"></span>
      <RunCounts {counts} suffix={countSuffix} variant="heading" />
    {/if}
  </div>
</div>
