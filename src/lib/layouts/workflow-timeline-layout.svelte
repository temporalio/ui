<script lang="ts">
  import { beforeNavigate, goto } from '$app/navigation';
  import { page } from '$app/state';

  import ActivityCommands from '$lib/components/activity/activity-commands.svelte';
  import EventGroupControls from '$lib/components/lines-and-dots/event-group-filter/event-group-controls.svelte';
  import WorkflowError from '$lib/components/lines-and-dots/workflow-error.svelte';
  import WorkflowTimeline from '$lib/components/lines-and-dots/workflow-timeline.svelte';
  import DownloadEventHistoryModal from '$lib/components/workflow/download-event-history-modal.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import WorkflowCallbacks from '$lib/components/workflow/workflow-callbacks.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconDownload } from '$lib/io/icon';
  import { getWorkflowHistoryController } from '$lib/services/workflow-history-controller.svelte.js';
  import {
    collapseIdleTime,
    eventFilterSort,
    type EventSortOrder,
    showTimelineEventGroups,
  } from '$lib/stores/event-view';
  import { pauseLiveUpdates } from '$lib/stores/events';
  import { eventStatusFilter, eventTypeFilter } from '$lib/stores/filters';
  import { triggerRefresh, workflowRun } from '$lib/stores/workflow-run';
  import type {
    EventTypeFilterChange,
    WorkflowTaskFailedEvent,
    WorkflowTaskTimedOutEvent,
  } from '$lib/types/events';
  import {
    parseEventFilterParams,
    updateEventFilterParams,
  } from '$lib/utilities/event-filter-params';

  const historyController = getWorkflowHistoryController();

  const namespace = $derived(page.params.namespace);
  const workflow = $derived($workflowRun.workflow);

  const urlParams = $derived(parseEventFilterParams(page.url));
  $effect(() => {
    $eventFilterSort = urlParams.sort;
    $pauseLiveUpdates = urlParams.refresh_off;
    $eventStatusFilter = urlParams.statusFilter;
  });

  const onAutoRefreshToggle = () => {
    updateEventFilterParams(
      page.url,
      { refresh_off: !$pauseLiveUpdates },
      goto,
    );
  };

  const onSortChange = (sort: EventSortOrder) => {
    updateEventFilterParams(page.url, { sort }, goto);
  };

  const onCollapseIdleTimeChange = (collapsed: boolean) => {
    $collapseIdleTime = collapsed ? 'on' : 'off';
  };

  const onEventTypeFilterChange = ({
    eventTypes,
    statusFilter,
    allEventTypes,
  }: EventTypeFilterChange) => {
    $eventTypeFilter = eventTypes;
    $eventStatusFilter = statusFilter;
    updateEventFilterParams(
      page.url,
      { categories: allEventTypes ? null : eventTypes, statusFilter },
      goto,
    );
  };

  const hasTimelineEventGroups = $derived(
    historyController.history.hasTimelineEventGroups,
  );
  const eventGroupsVisible = $derived(
    $showTimelineEventGroups ??
      historyController.history.hasUserDefinedEventGroups,
  );

  const onEventGroupsToggle = () => {
    activeGroupId = undefined;
    void showTimelineEventGroups.save(!eventGroupsVisible);
  };

  const workflowTaskFailedError = $derived.by(() => {
    if (!historyController.fetchComplete) return undefined;
    return historyController.history.workflowTaskFailedEvent as
      | WorkflowTaskFailedEvent
      | WorkflowTaskTimedOutEvent
      | undefined;
  });

  const isNotPending = $derived(
    Boolean(workflow && !workflow?.isRunning && !workflow?.isPaused),
  );

  let activeGroupId = $state<string>();

  beforeNavigate(() => {
    activeGroupId = undefined;
  });

  let showDownloadPrompt = $state(false);
</script>

<InputAndResults events={historyController.history.events} />
<div class="flex flex-col gap-2">
  {#if workflowTaskFailedError}
    <WorkflowError
      error={workflowTaskFailedError}
      pendingTask={workflow?.pendingWorkflowTask}
    />
  {/if}
  {#if workflow?.callbacks?.length}
    <WorkflowCallbacks
      callbacks={workflow.callbacks}
      initialEvent={historyController.history.initialEvent}
    />
  {/if}
</div>

{#if workflow}
  <WorkflowTimeline
    {namespace}
    {workflow}
    sort={$eventFilterSort}
    {onSortChange}
    collapseIdleTime={$collapseIdleTime === 'on'}
    {onCollapseIdleTimeChange}
    eventTypes={$eventTypeFilter}
    failedOrPendingOnly={$eventStatusFilter}
    {onEventTypeFilterChange}
    eventGroupKeys={urlParams.eventGroups}
    {eventGroupsVisible}
    bind:activeGroupId
  >
    {#snippet controls()}
      <ToggleButtons
        class={hasTimelineEventGroups
          ? 'empty:hidden max-xl:[&>:last-child_.menu-button-anchor>button]:rounded-r'
          : 'empty:hidden max-xl:[&_.menu-button-anchor>button]:rounded max-xl:[&_.menu-button-anchor>button]:border-l'}
      >
        <EventGroupControls
          options={historyController.history.eventGroupOptions}
        >
          {#snippet toggle()}
            {#if hasTimelineEventGroups}
              <ToggleButton
                data-testid="toggle-event-groups"
                size="sm"
                variant="tertiary"
                class="max-xl:rounded-l xl:border-l-0 [&:not(:last-child)]:border-r"
                onclick={onEventGroupsToggle}
              >
                {eventGroupsVisible
                  ? translate('workflows.hide-event-groups')
                  : translate('workflows.show-event-groups')}
              </ToggleButton>
            {/if}
          {/snippet}
        </EventGroupControls>
      </ToggleButtons>
      <ToggleButtons>
        <ToggleButton
          disabled={isNotPending}
          data-testid="pause"
          class="xl:!rounded-l-none xl:border-l-0"
          size="sm"
          variant="tertiary"
          onclick={onAutoRefreshToggle}
        >
          <span
            class="h-1.5 w-1.5 rounded-full {$pauseLiveUpdates || isNotPending
              ? 'bg-content-tertiary'
              : 'bg-content-static-success'}"
          ></span>
          {$pauseLiveUpdates || isNotPending
            ? translate('workflows.auto-refresh-off')
            : translate('workflows.auto-refresh-on')}
        </ToggleButton>
        <ToggleButton
          data-testid="download"
          LeadingIcon={IconDownload}
          size="sm"
          variant="tertiary"
          onclick={() => (showDownloadPrompt = true)}
        >
          {translate('common.download')}
        </ToggleButton>
      </ToggleButtons>
    {/snippet}
    {#snippet activityActions(activity)}
      <ActivityCommands
        {activity}
        workflowExecutionIdentity={historyController.workflowExecutionIdentity}
        {workflow}
        onRefresh={triggerRefresh}
        class="justify-end"
      />
    {/snippet}
  </WorkflowTimeline>

  <DownloadEventHistoryModal
    bind:open={showDownloadPrompt}
    {namespace}
    workflowId={workflow.id}
    runId={workflow.runId}
  />
{/if}
