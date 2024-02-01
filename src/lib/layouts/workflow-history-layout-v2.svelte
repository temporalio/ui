<script lang="ts">
  import groupBy from 'lodash.groupby';

  import EventHistoryTimeline from '$lib/components/event/event-history-timeline.svelte';
  import PayloadDecoder from '$lib/components/event/payload-decoder.svelte';
  import DraggableLine from '$lib/components/lines-and-dots/draggable-line.svelte';
  import EventGraph, {
    gap,
  } from '$lib/components/lines-and-dots/event-graph.svelte';
  import EventRow from '$lib/components/lines-and-dots/event-row.svelte';
  import GroupRow from '$lib/components/lines-and-dots/group-row.svelte';
  import InputAndResultRow from '$lib/components/lines-and-dots/input-and-result-row.svelte';
  import InputAndResults from '$lib/components/workflow/input-and-results.svelte';
  import PendingActivities from '$lib/components/workflow/pending-activities.svelte';
  import WorkflowJsonNavigator from '$lib/components/workflow/workflow-json-navigator.svelte';
  import WorkflowRelationships from '$lib/components/workflow/workflow-relationships.svelte';
  import WorkflowSummary from '$lib/components/workflow/workflow-summary.svelte';
  import Accordion from '$lib/holocene/accordion.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
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
  $: timeBasedGroups = groupBy(groups, (g) => g.timestamp);

  let activeGroup: undefined | EventGroup;
  let activeEvent: undefined | WorkflowEvent;

  // let showDownloadPrompt = false;

  const setActive = (event: WorkflowEvent) => {
    activeEvent = event;
    activeGroup = groups.find((g) => g.eventIds.has(event.id));
  };

  const onHoverLeave = () => {
    activeGroup = undefined;
    activeEvent = undefined;
  };

  $: initialEvent = $fullEventHistory.find((e) => e.id === '1');

  $: workflowRelationships = getWorkflowRelationships(
    workflow,
    $fullEventHistory,
    $namespaces,
  );

  let canvasWidth = 150;
  $: canvasHeight = gap + gap * $fullEventHistory.length;

  const onExpand = (x: number) => {
    if (x >= 10 && x < 990) {
      canvasWidth = x;
    }
  };
</script>

<div class="flex flex-col gap-2">
  <WorkflowSummary />
  <WorkflowRelationships {...workflowRelationships} />
  <PendingActivities />
  <section>
    <Accordion
      title={workflowEvents.contAsNew
        ? translate('workflows.input')
        : translate('workflows.input-and-results')}
      icon="json"
      class=""
      data-testid="input-and-results"
    >
      <div class="flex w-full flex-col gap-2 lg:flex-row">
        <InputAndResults
          title="Input"
          content={workflowEvents.input}
          data-testid="workflow-input"
        />
        <InputAndResults
          content={workflowEvents.results}
          title={workflowEvents.contAsNew
            ? translate('workflows.continued-as-new-with-input')
            : translate('workflows.results')}
          data-testid="workflow-results"
        />
      </div>
    </Accordion>
  </section>
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
        icon="json"
        active={$eventViewType === 'json'}
        data-testid="json"
        on:click={() => ($eventViewType = 'json')}
        >{translate('workflows.json')}</ToggleButton
      > -->
      <!-- <ToggleButton
        icon="download"
        data-testid="download"
        on:click={() => (showDownloadPrompt = true)}
      ></ToggleButton> -->
    </ToggleButtons>
  </div>
  {#if $fullEventHistory.length}
    <div
      class="flex w-full flex-col gap-0 rounded-lg bg-slate-900 md:h-auto md:flex-row"
    >
      <div class="flex w-full flex-col gap-1 rounded-lg bg-slate-950">
        {#if $eventViewType === 'feed'}
          <div class="flex gap-0">
            <EventGraph
              history={$fullEventHistory}
              {groups}
              {canvasHeight}
              {canvasWidth}
              {activeGroup}
              onHover={setActive}
              {onHoverLeave}
            >
              <DraggableLine x={canvasWidth} height={canvasHeight} {onExpand} />
            </EventGraph>
            <div class="relative flex w-full shrink gap-0 bg-slate-800">
              <div>
                <InputAndResultRow title="Input" />
                {#each $fullEventHistory as event}
                  <EventRow {event} onClick={setActive} {activeGroup} />
                {/each}
                <InputAndResultRow title="Result" />
              </div>
              <div class="relative h-full w-full">
                <div class="sticky top-12 h-auto w-full">
                  {#if !activeEvent}
                    <InputAndResults
                      title="Input"
                      content={workflowEvents.input}
                      data-testid="workflow-input"
                    />
                  {:else}
                    {#key activeEvent}
                      <PayloadDecoder
                        value={activeEvent}
                        key="payloads"
                        let:decodedValue
                      >
                        <CodeBlock
                          content={decodedValue}
                          copyIconTitle={translate('common.copy-icon-title')}
                          copySuccessIconTitle={translate(
                            'common.copy-success-icon-title',
                          )}
                        />
                      </PayloadDecoder>
                    {/key}
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {:else if $eventViewType === 'compact'}
          {#each groups as group}
            <GroupRow
              {group}
              {initialEvent}
              level={Object.keys(timeBasedGroups).indexOf(group.timestamp)}
            />
          {/each}
        {:else if $eventViewType === 'json'}
          <WorkflowJsonNavigator events={$fullEventHistory} />
        {/if}
      </div>
    </div>
  {/if}
</div>
