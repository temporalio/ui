<script lang="ts">
  import { beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/state';

  import EventHistoryLegend from '$lib/components/lines-and-dots/event-history-legend.svelte';
  import EventTimeFilter from '$lib/components/lines-and-dots/event-time-filter.svelte';
  import EventTypeFilter from '$lib/components/lines-and-dots/event-type-filter.svelte';
  import TimelineGraph from '$lib/components/lines-and-dots/svg/timeline-graph.svelte';
  import WorkflowError from '$lib/components/lines-and-dots/workflow-error.svelte';
  import DownloadEventHistoryModal from '$lib/components/workflow/download-event-history-modal.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import WorkflowCallbacks from '$lib/components/workflow/workflow-callbacks.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import { clearActives } from '$lib/stores/active-events';
  import { eventFilterSort, eventTimeFilter } from '$lib/stores/event-view';
  import {
    currentEventHistory,
    pauseLiveUpdates,
    typeFilteredEventHistory,
  } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import {
    parseEventFilterParams,
    updateEventFilterParams,
  } from '$lib/utilities/event-filter-params';
  import { getWorkflowTaskFailedEvent } from '$lib/utilities/get-workflow-task-failed-event';
  import { orderGroupsByPending } from '$lib/utilities/order-groups-by-pending';

  const namespace = $derived(page.params.namespace);
  const workflow = $derived($workflowRun.workflow);
  const pendingActivities = $derived(workflow?.pendingActivities);
  const pendingNexusOperations = $derived(workflow?.pendingNexusOperations);

  const urlParams = $derived(parseEventFilterParams(page.url));

  $effect(() => {
    $eventFilterSort = urlParams.sort;
    $pauseLiveUpdates = urlParams.refresh_off;
    $eventTimeFilter = {
      startTime: urlParams.timeStart ? new Date(urlParams.timeStart) : null,
      endTime: urlParams.timeEnd ? new Date(urlParams.timeEnd) : null,
    };
  });

  const reverseSort = $derived($eventFilterSort === 'descending');

  const firstEventTime = $derived.by(() => {
    const first = $currentEventHistory[0];
    return first?.eventTime ? new Date(first.eventTime as string) : null;
  });

  const lastEventTime = $derived.by(() => {
    const last = $currentEventHistory[$currentEventHistory.length - 1];
    return last?.eventTime ? new Date(last.eventTime as string) : null;
  });

  const defaultStart = $derived(
    firstEventTime ??
      (workflow?.startTime ? new Date(workflow.startTime as string) : null),
  );

  const workflowCompleted = $derived(
    workflow && !workflow?.isRunning && !workflow?.isPaused,
  );
  const defaultEnd = $derived(
    workflowCompleted
      ? (lastEventTime ??
          (workflow?.endTime ? new Date(workflow.endTime as string) : null))
      : null,
  );

  const ascendingGroups = $derived(
    groupEvents(
      $typeFilteredEventHistory,
      'ascending',
      pendingActivities,
      pendingNexusOperations,
    ),
  );

  const groupsInWindow = $derived.by(() => {
    const startMs = $eventTimeFilter.startTime?.getTime() ?? null;
    const endMs = $eventTimeFilter.endTime?.getTime() ?? null;
    if (startMs === null && endMs === null) return ascendingGroups;
    return ascendingGroups.filter((group) =>
      group.eventList.some((event) => {
        if (!event.eventTime) return false;
        const evMs = new Date(event.eventTime as string).getTime();
        if (startMs !== null && evMs < startMs) return false;
        if (endMs !== null && evMs > endMs) return false;
        return true;
      }),
    );
  });

  const groups = $derived(
    orderGroupsByPending(
      reverseSort ? [...groupsInWindow].reverse() : groupsInWindow,
      reverseSort,
    ),
  );

  const workflowTaskFailedError = $derived(
    getWorkflowTaskFailedEvent($currentEventHistory, 'ascending'),
  );

  const isNotPending = $derived(
    Boolean(workflow && !workflow?.isRunning && !workflow?.isPaused),
  );

  const autoRefreshDisabledByEndTime = $derived(
    !isNotPending && $eventTimeFilter.endTime !== null,
  );

  beforeNavigate(() => {
    clearActives();
  });

  $effect(() => {
    if (isNotPending && $pauseLiveUpdates) {
      $pauseLiveUpdates = false;
    }
  });

  $effect(() => {
    if (autoRefreshDisabledByEndTime && !$pauseLiveUpdates) {
      updateEventFilterParams(page.url, { refresh_off: true }, goto);
    }
  });

  let showDownloadPrompt = $state(false);

  const onSort = () => {
    const newSort = reverseSort ? 'ascending' : 'descending';
    updateEventFilterParams(page.url, { sort: newSort }, goto);
  };

  const onAutoRefreshToggle = () => {
    updateEventFilterParams(
      page.url,
      { refresh_off: !$pauseLiveUpdates },
      goto,
    );
  };
</script>

<InputAndResults />
<div class="flex flex-col gap-2">
  {#if workflowTaskFailedError}
    <WorkflowError
      error={workflowTaskFailedError}
      pendingTask={workflow?.pendingWorkflowTask}
    />
  {/if}
  {#if workflow?.callbacks?.length}
    <WorkflowCallbacks callbacks={workflow.callbacks} />
  {/if}
</div>
<div class="relative pb-24">
  <div
    class="surface-background sticky top-0 z-[11] flex flex-wrap items-center justify-between gap-2 border-b border-subtle pb-2 md:top-[var(--top-nav-height)] md:pt-2 xl:gap-8"
  >
    <div class="flex items-center gap-2">
      <h2>
        {translate('workflows.timeline-tab')}
      </h2>
      <EventHistoryLegend />
    </div>
    <div class="flex items-center gap-2">
      <ToggleButtons>
        <EventTimeFilter {defaultStart} {defaultEnd} />
        <ToggleButton
          leadingIcon={reverseSort ? 'descending' : 'ascending'}
          data-testid="zoom-in"
          on:click={onSort}
          size="sm"
          class="border-l-0"
          >{reverseSort ? 'Descending' : 'Ascending'}</ToggleButton
        >
        <EventTypeFilter compact={false} />
        <Tooltip
          top
          text={translate('workflows.auto-refresh-disabled-end-time')}
          hide={!autoRefreshDisabledByEndTime}
        >
          <ToggleButton
            disabled={isNotPending || autoRefreshDisabledByEndTime}
            data-testid="pause"
            class="border-l-0"
            size="sm"
            on:click={onAutoRefreshToggle}
          >
            <span
              class="h-1.5 w-1.5 rounded-full {$pauseLiveUpdates || isNotPending
                ? 'bg-slate-300'
                : 'bg-green-600'}"
            ></span>
            {$pauseLiveUpdates || isNotPending
              ? translate('workflows.auto-refresh-off')
              : translate('workflows.auto-refresh-on')}
          </ToggleButton>
        </Tooltip>
        <ToggleButton
          data-testid="download"
          leadingIcon="download"
          size="sm"
          on:click={() => (showDownloadPrompt = true)}
        >
          {translate('common.download')}
        </ToggleButton>
      </ToggleButtons>
    </div>
  </div>
  {#if workflow}
    <div class="flex w-full flex-col">
      <TimelineGraph
        {workflow}
        {groups}
        viewportHeight={undefined}
        error={Boolean(workflowTaskFailedError)}
        overrideStartTime={$eventTimeFilter.startTime?.toISOString()}
        overrideEndTime={$eventTimeFilter.endTime?.toISOString()}
      />
    </div>
  {/if}
</div>
{#if workflow}
  <DownloadEventHistoryModal
    bind:open={showDownloadPrompt}
    {namespace}
    workflowId={workflow.id}
    runId={workflow.runId}
  />
{/if}
