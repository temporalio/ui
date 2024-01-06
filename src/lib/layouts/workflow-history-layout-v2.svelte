<script lang="ts">
  import groupBy from 'lodash.groupby';

  import EventGraph from '$lib/components/lines-and-dots/event-graph.svelte';
  import EventRow from '$lib/components/lines-and-dots/event-row.svelte';
  import GroupRow from '$lib/components/lines-and-dots/group-row.svelte';
  import InputAndResultRow from '$lib/components/lines-and-dots/input-and-result-row.svelte';
  import WorkflowJsonNavigator from '$lib/components/workflow/workflow-json-navigator.svelte';
  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { fullEventHistory } from '$lib/stores/events';
  import type { WorkflowEvent } from '$lib/types/events';
  import { getWorkflowStartedCompletedAndTaskFailedEvents } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import { parseWithBigInt } from '$lib/utilities/parse-with-big-int';

  $: groups = groupEvents($fullEventHistory);
  $: workflowEvents =
    getWorkflowStartedCompletedAndTaskFailedEvents($fullEventHistory);
  $: timeBasedGroups = groupBy(groups, (g) => g.timestamp);

  let activeGroup: undefined | EventGroup;
  let zoom = 1;

  const onHover = (event: WorkflowEvent) => {
    activeGroup = groups.find((g) => g.eventIds.has(event.id));
  };

  const onHoverLeave = () => {
    activeGroup = undefined;
  };

  $: initialEvent = $fullEventHistory.find((e) => e.id === '1');
</script>

<div class="flex flex-col gap-2">
  <div class="flex justify-end">
    <div class="flex items-center gap-1 text-xl">
      <span>-</span>
      <input
        name="range"
        type="range"
        class="h-0 w-24 w-full cursor-pointer appearance-none rounded border-y-2 border-blurple"
        bind:value={zoom}
        min={1}
        max={4}
        step={1}
      />
      <span>+</span>
    </div>
  </div>
  {#if $fullEventHistory.length}
    <div
      class="flex w-full flex-col gap-0 rounded-lg bg-blueGray-900 md:h-auto md:flex-row"
    >
      <div
        class="flex w-full flex-col gap-1 rounded-lg bg-blueGray-900 {zoom !==
          4 && 'py-2'}"
      >
        {#if zoom === 1}
          <EventGraph history={$fullEventHistory} />
        {:else if zoom == 2}
          <InputAndResultRow
            title="Input"
            value={parseWithBigInt(workflowEvents?.input)}
          />
          {#each groups as group}
            <GroupRow
              {group}
              {initialEvent}
              level={Object.keys(timeBasedGroups).indexOf(group.timestamp)}
            />
          {/each}
          <InputAndResultRow
            title="Result"
            value={parseWithBigInt(workflowEvents?.results)}
          />
        {:else if zoom == 3}
          <InputAndResultRow
            title="Input"
            value={parseWithBigInt(workflowEvents?.input)}
          />
          {#each $fullEventHistory as event}
            <EventRow {event} {onHover} {onHoverLeave} {activeGroup} />
          {/each}
          <InputAndResultRow
            title="Result"
            value={parseWithBigInt(workflowEvents?.results)}
          />
        {:else}
          <WorkflowJsonNavigator events={$fullEventHistory} />
        {/if}
      </div>
    </div>
  {/if}
</div>
