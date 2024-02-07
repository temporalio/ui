<script lang="ts">
  import EventGraph from '$lib/components/lines-and-dots/history-graph.svelte';
  import InputAndResults from '$lib/components/lines-and-dots/input-and-results.svelte';
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
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';

  $: ({ workflow } = $workflowRun);
  $: groups = groupEvents($fullEventHistory);
  $: pendingActivities = workflow?.pendingActivities;

  let activeGroup: EventGroup | undefined = undefined;
  let activeEvent: WorkflowEvent | undefined = undefined;

  // let showDownloadPrompt = false;

  const clearActives = () => {
    activeGroup = undefined;
    activeEvent = undefined;
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

  $: compact = $eventViewType === 'compact';
  $: workflow, compact, clearActives();
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

  <div class="flex flex-col gap-0">
    <InputAndResults history={$fullEventHistory} />
    {#if compact}
      <TimelineGraph
        {workflow}
        {groups}
        {pendingActivities}
        {activeGroup}
        {activeEvent}
        onClick={setActiveGroup}
        clearActive={clearActives}
      />
    {:else}
      <EventGraph
        history={$fullEventHistory}
        {groups}
        {pendingActivities}
        {activeGroup}
        {activeEvent}
        onClick={setActiveEvent}
        clearActive={clearActives}
      />
    {/if}
  </div>
</div>
