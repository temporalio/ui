<script lang="ts">
  import { noop } from 'svelte/internal';
  import { fly } from 'svelte/transition';

  import EventHistoryTimeline from '$lib/components/event/event-history-timeline.svelte';
  import DetailsDrawer from '$lib/components/lines-and-dots/details-drawer.svelte';
  import DraggableLine from '$lib/components/lines-and-dots/draggable-line.svelte';
  import EventGraph, {
    gap,
  } from '$lib/components/lines-and-dots/event-graph.svelte';
  import EventRow from '$lib/components/lines-and-dots/event-row.svelte';
  import GroupRow from '$lib/components/lines-and-dots/group-row.svelte';
  import InputAndResultRow from '$lib/components/lines-and-dots/input-and-result-row.svelte';
  import PendingActivities from '$lib/components/workflow/pending-activities.svelte';
  import WorkflowRelationships from '$lib/components/workflow/workflow-relationships.svelte';
  import WorkflowSummary from '$lib/components/workflow/workflow-summary.svelte';
  import Accordion from '$lib/holocene/accordion.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { eventViewType } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';
  import { namespaces } from '$lib/stores/namespaces';
  import {
    workflowRun,
    workflowTimelineViewOpen,
  } from '$lib/stores/workflow-run';
  import type { WorkflowEvent } from '$lib/types/events';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';

  $: ({ workflow } = $workflowRun);
  $: groups = groupEvents($fullEventHistory);
  $: workflowEvents =
    getWorkflowStartedCompletedAndTaskFailedEvents($fullEventHistory);

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

  const setActiveEvent = (event: WorkflowEvent) => {
    if (event.id === activeEvent?.id) {
      clearActives();
    } else {
      activeEvent = event;
      activeGroup = groups.find((g) => g.eventIds.has(event.id));
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

  $: workflowRelationships = getWorkflowRelationships(
    workflow,
    $fullEventHistory,
    $namespaces,
  );

  $: compact = $eventViewType === 'compact';
  $: canvasWidth = 100;
  $: canvasHeight =
    gap * 2 + gap * (compact ? groups.length : $fullEventHistory.length);

  const onExpand = (x: number) => {
    if (x >= 10 && x < 990) {
      canvasWidth = x;
    }
  };

  $: workflow, compact, clearActives();
  $: drawerOpen = activeEvent || activeGroup;
</script>

<div class="flex flex-col gap-2">
  <WorkflowSummary />
  <WorkflowRelationships {...workflowRelationships} />
  <PendingActivities />
  <Accordion
    title={translate('common.timeline')}
    data-testid="timeline-accordion"
    icon="timeline"
    open={$workflowTimelineViewOpen}
    onToggle={() => {
      $workflowTimelineViewOpen = !$workflowTimelineViewOpen;
    }}
  >
    <EventHistoryTimeline history={$fullEventHistory} />
  </Accordion>

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
    class="flex w-full flex-col gap-0 rounded-lg bg-slate-900 md:h-auto md:flex-row"
  >
    <div class="flex w-full flex-col gap-1 rounded-lg bg-slate-950">
      {#if compact}
        <div class="flex gap-0">
          <EventGraph
            history={$fullEventHistory}
            {groups}
            {canvasHeight}
            {canvasWidth}
            {activeGroup}
            {activeEvent}
            onHover={noop}
            compact
          >
            <DraggableLine x={canvasWidth} height={canvasHeight} {onExpand} />
          </EventGraph>
          <div class="relative flex w-full shrink gap-0 bg-slate-800">
            <div>
              <InputAndResultRow
                type="input"
                content={workflowEvents.input}
                onClick={() => setInputOrResults('input')}
                active={activeEvent === 'input'}
              />
              {#each groups as group}
                <GroupRow
                  {group}
                  onClick={() => setActiveGroup(group)}
                  active={activeGroup?.id === group.id}
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
              <div
                class="relative h-full w-full bg-slate-950"
                transition:fly={{ x: 100 }}
              >
                <div class="sticky top-12 h-auto w-full">
                  <DetailsDrawer
                    {activeEvent}
                    {activeGroup}
                    {workflowEvents}
                    {workflow}
                    {compact}
                  />
                </div>
              </div>
            {/if}
          </div>
        </div>
      {:else}
        <div class="flex gap-0">
          <EventGraph
            history={$fullEventHistory}
            {groups}
            {canvasHeight}
            {canvasWidth}
            {activeGroup}
            {activeEvent}
            onHover={setActiveEvent}
          >
            <DraggableLine x={canvasWidth} height={canvasHeight} {onExpand} />
          </EventGraph>
          <div class="relative flex w-full shrink gap-0 bg-slate-800">
            <div>
              <InputAndResultRow
                type="input"
                content={workflowEvents.input}
                onClick={() => setInputOrResults('input')}
                active={activeEvent === 'input'}
              />
              {#each $fullEventHistory as event}
                <EventRow
                  {event}
                  onClick={setActiveEvent}
                  active={activeEvent?.id === event.id ||
                    Boolean(activeGroup?.eventIds?.has(event.id))}
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
              <div
                class="relative h-full w-full bg-slate-950"
                transition:fly={{ x: 100 }}
              >
                <div class="sticky top-12 h-auto w-full">
                  <DetailsDrawer
                    {activeEvent}
                    {activeGroup}
                    {workflowEvents}
                    {workflow}
                    {compact}
                  />
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
