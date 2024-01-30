<script lang="ts">
  import groupBy from 'lodash.groupby';

  import EventGraph from '$lib/components/lines-and-dots/event-graph.svelte';
  import EventRow from '$lib/components/lines-and-dots/event-row.svelte';
  import GroupRow from '$lib/components/lines-and-dots/group-row.svelte';
  // import InputAndResultRow from '$lib/components/lines-and-dots/input-and-result-row.svelte';
  import WorkflowJsonNavigator from '$lib/components/workflow/workflow-json-navigator.svelte';
  import WorkflowRelationships from '$lib/components/workflow/workflow-relationships.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { eventViewType } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';
  import { namespaces } from '$lib/stores/namespaces';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { WorkflowEvent } from '$lib/types/events';
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';
  // import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';
  // import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';

  $: ({ workflow } = $workflowRun);
  $: groups = groupEvents($fullEventHistory);
  // $: workflowEvents =
  //   getWorkflowStartedCompletedAndTaskFailedEvents($fullEventHistory);
  $: timeBasedGroups = groupBy(groups, (g) => g.timestamp);

  let activeGroup: undefined | EventGroup;
  // let showDownloadPrompt = false;

  const onHover = (event: WorkflowEvent) => {
    activeGroup = groups.find((g) => g.eventIds.has(event.id));
  };

  const onHoverLeave = () => {
    activeGroup = undefined;
  };

  $: initialEvent = $fullEventHistory.find((e) => e.id === '1');

  $: workflowRelationships = getWorkflowRelationships(
    workflow,
    $fullEventHistory,
    $namespaces,
  );
</script>

<div class="flex flex-col gap-2">
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
      class="flex w-full flex-col gap-0 rounded-lg bg-blueGray-900 md:h-auto md:flex-row"
    >
      <div class="flex w-full flex-col gap-1 rounded-lg bg-blueGray-900">
        {#if $eventViewType === 'feed'}
          <div class="flex gap-0">
            <EventGraph history={$fullEventHistory} {groups} {activeGroup} />
            <div class="w-full">
              {#each $fullEventHistory as event}
                <EventRow {event} {onHover} {onHoverLeave} {activeGroup} />
              {/each}
            </div>
          </div>
        {:else if $eventViewType === 'compact'}
          <!-- <InputAndResultRow
            title="Input"
            value={parseWithBigInt(workflowEvents?.input)}
          /> -->
          {#each groups as group}
            <GroupRow
              {group}
              {initialEvent}
              level={Object.keys(timeBasedGroups).indexOf(group.timestamp)}
            />
          {/each}
          <!-- <InputAndResultRow
            title="Result"
            value={parseWithBigInt(workflowEvents?.results)}
          /> -->
        {:else if $eventViewType === 'json'}
          <WorkflowJsonNavigator events={$fullEventHistory} />
        {/if}
      </div>
    </div>
  {/if}
</div>
