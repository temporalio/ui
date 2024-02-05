<script lang="ts">
  import { noop } from 'svelte/internal';

  import DetailsDrawer from '$lib/components/lines-and-dots/details-drawer.svelte';
  import DraggableXLine from '$lib/components/lines-and-dots/draggable-x-line.svelte';
  import EventRow from '$lib/components/lines-and-dots/event-row.svelte';
  import GroupRow from '$lib/components/lines-and-dots/group-row.svelte';
  import EventGraph, {
    gap,
  } from '$lib/components/lines-and-dots/history-graph.svelte';
  import InputAndResultRow from '$lib/components/lines-and-dots/input-and-result-row.svelte';
  import PendingActivityRow from '$lib/components/lines-and-dots/pending-activity-row.svelte';
  import TimelineGraph from '$lib/components/lines-and-dots/timeline-graph.svelte';
  import WorkflowRelationships from '$lib/components/workflow/workflow-relationships.svelte';
  import WorkflowSummary from '$lib/components/workflow/workflow-summary.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { eventViewType } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';
  import { namespaces } from '$lib/stores/namespaces';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { PendingActivity, WorkflowEvent } from '$lib/types/events';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';

  $: ({ workflow } = $workflowRun);
  $: groups = groupEvents($fullEventHistory);
  $: workflowEvents =
    getWorkflowStartedCompletedAndTaskFailedEvents($fullEventHistory);
  $: pendingActivities = workflow?.pendingActivities;

  let activeGroup: undefined | EventGroup;
  let activeEvent: WorkflowEvent | 'input' | 'results' | undefined;

  // let showDownloadPrompt = false;

  const clearActives = () => {
    activeGroup = undefined;
    activeEvent = undefined;
  };

  const setInputOrResults = (type: 'input' | 'results') => {
    if (type === activeEvent) {
      clearActives();
    } else {
      activeEvent = type;
      activeGroup = undefined;
    }
  };

  const setActiveEvent = (event: WorkflowEvent | PendingActivity) => {
    if (event.id === activeEvent?.id) {
      clearActives();
    } else {
      activeEvent = event;
      activeGroup = groups.find((g) => g.eventIds.has(event?.id));
    }
  };

  const setActiveGroup = (group: EventGroup) => {
    if (group.id === activeGroup?.id) {
      clearActives();
    } else {
      activeEvent = undefined;
      activeGroup = group;
    }
  };

  const onExpand = (x: number) => {
    if (x >= 10 && x < 990) {
      canvasWidth = x;
    }
  };

  let compactCanvasWidth;
  let canvasWidth = 100;

  $: compact = $eventViewType === 'compact';
  $: canvasHeight =
    gap * 2 + gap * ($fullEventHistory.length + pendingActivities.length);
  $: workflow, compact, clearActives();
  $: drawerOpen = activeEvent || activeGroup;
  $: workflowRelationships = getWorkflowRelationships(
    workflow,
    $fullEventHistory,
    $namespaces,
  );
</script>

<div class="flex flex-col gap-2">
  <WorkflowSummary />
  <WorkflowRelationships {...workflowRelationships} />
  <div class="flex items-center justify-start gap-4 px-4 py-2">
    <h2 class="text-xl font-medium">
      {translate('workflows.event-history')}
    </h2>
    <ToggleButtons>
      <ToggleButton
        active={$eventViewType === 'compact'}
        data-testid="compact"
        on:click={() => ($eventViewType = 'compact')}
        >{translate('workflows.compact')}</ToggleButton
      >
      <ToggleButton
        active={$eventViewType === 'feed'}
        data-testid="feed"
        on:click={() => ($eventViewType = 'feed')}
        >{translate('workflows.full-history')}</ToggleButton
      >
      <!-- <ToggleButton
        icon="download"
        data-testid="download"
        on:click={() => (showDownloadPrompt = true)}
      ></ToggleButton> -->
    </ToggleButtons>
  </div>
  <div
    class="flex w-full flex-col gap-0 bg-slate-950"
    bind:clientWidth={compactCanvasWidth}
  >
    {#if compact}
      <TimelineGraph
        {workflow}
        canvasWidth={compactCanvasWidth}
        {groups}
        {pendingActivities}
        {activeGroup}
        {activeEvent}
        onHover={noop}
      />
    {/if}
    <div class="flex w-full flex-col gap-0">
      <div class="flex gap-0">
        {#if !compact}
          <EventGraph
            history={$fullEventHistory}
            {groups}
            {pendingActivities}
            {canvasHeight}
            {canvasWidth}
            {activeGroup}
            {activeEvent}
            onHover={noop}
          >
            <DraggableXLine x={canvasWidth} height={canvasHeight} {onExpand} />
          </EventGraph>
        {/if}
        <div class="relative flex w-full shrink gap-0 bg-slate-800">
          <div class="w-full">
            <InputAndResultRow
              type="input"
              content={workflowEvents.input}
              onClick={() => setInputOrResults('input')}
              active={activeEvent === 'input'}
            />
            {#if compact}
              {#each groups as group}
                <GroupRow
                  {group}
                  onClick={() => setActiveGroup(group)}
                  active={activeGroup?.id === group.id}
                />
              {/each}
            {:else}
              {#each $fullEventHistory as event}
                <EventRow
                  {event}
                  onClick={setActiveEvent}
                  active={activeEvent?.id === event.id ||
                    Boolean(activeGroup?.eventIds?.has(event.id))}
                />
              {/each}
            {/if}
            {#each pendingActivities as pendingActivity}
              <PendingActivityRow
                {pendingActivity}
                onClick={setActiveEvent}
                active={pendingActivity.activityId === activeEvent?.activityId}
              />
            {/each}
            <InputAndResultRow
              type="result"
              content={workflowEvents.results}
              onClick={() => setInputOrResults('results')}
              active={activeEvent === 'results'}
            />
          </div>
          {#if drawerOpen}
            <DetailsDrawer
              {activeEvent}
              {activeGroup}
              {workflowEvents}
              {workflow}
              {compact}
            />
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
