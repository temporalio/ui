<script lang="ts">
  import { page } from '$app/stores';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { isChildWorkflowClosedEvent } from '$lib/utilities/get-workflow-relationships';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  $: ({
    namespace,
    workflow: workflowId,
    run: runId,
    id: groupId,
  } = $page.params);

  let eventGroup: EventGroup;
  let events: EventGroup[] = [];

  const resetFullHistory = () => {
    $fullEventHistory = [];
  };

  const fetchEvents = async (
    namespace: string,
    workflowId: string,
    runId: string,
  ) => {
    if ($workflowRun.workflow.id !== workflowId || !$fullEventHistory.length) {
      resetFullHistory();
      $fullEventHistory = await fetchAllEvents({
        namespace,
        workflowId,
        runId,
        sort: $eventFilterSort,
      });
    }
    eventGroup = groupEvents($fullEventHistory, $eventFilterSort).find(
      (e) => e.id === groupId,
    );
    if (eventGroup) events = [eventGroup];
  };

  $: fetchEvents(namespace, workflowId, runId);

  $: updating = !$fullEventHistory.length;

  function getLink(group: EventGroup) {
    const childEvent = group?.eventList.find(isChildWorkflowClosedEvent);
    return childEvent
      ? routeForEventHistory({
          namespace,
          workflow: childEvent.attributes.workflowExecution.workflowId,
          run: childEvent.attributes.workflowExecution.runId,
        })
      : '';
  }

  $: workflowLink = getLink(eventGroup);
</script>

<div class="px-8">
  {#if eventGroup}
    <h2 class="flex w-full items-center">
      {#if workflowLink}
        <Link href={workflowLink}>
          {eventGroup.displayName}
        </Link>
      {:else}
        {eventGroup.displayName}
      {/if}
    </h2>
  {/if}
  <div data-testid="event-summary-table">
    <EventSummaryTable items={events} groups={events} {updating} openExpanded />
  </div>
</div>
