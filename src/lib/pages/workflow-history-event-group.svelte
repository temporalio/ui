<script lang="ts">
  import { page } from '$app/stores';

  import EventEmptyRow from '$lib/components/event/event-empty-row.svelte';
  import EventHistoryTimeline from '$lib/components/event/event-history-timeline.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { groupEvents } from '$lib/models/event-groups';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { fullEventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { isChildWorkflowClosedEvent } from '$lib/utilities/get-workflow-relationships';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  const compact = true;

  $: ({
    namespace,
    workflow: workflowId,
    run: runId,
    id: groupId,
  } = $page.params);

  let loading = false;
  let eventGroup: EventGroup;
  let events: EventGroup[] = [];

  const resetFullHistory = () => {
    $fullEventHistory = [];
    loading = true;
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
      loading = false;
    }
    eventGroup = groupEvents($fullEventHistory, $eventFilterSort).find(
      (e) => e.id === groupId,
    );
    if (eventGroup) events = [eventGroup];
  };

  $: fetchEvents(namespace, workflowId, runId);

  $: initialItem = $fullEventHistory?.[0];
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

{#if eventGroup}
  <h2 class="flex w-full items-center text-lg font-medium">
    {#if workflowLink}
      <Link href={workflowLink}>
        {eventGroup.displayName}
      </Link>
    {:else}
      {eventGroup.displayName}
    {/if}
  </h2>
{/if}
<EventHistoryTimeline history={$fullEventHistory} maxHeight={240} />
<EventSummaryTable {updating}>
  {#each events as event (`${event.id}-${event.timestamp}`)}
    <EventSummaryRow
      {event}
      {compact}
      expandAll={true}
      {initialItem}
      active={true}
    />
  {:else}
    <EventEmptyRow
      {loading}
      title={translate('events.group-empty-state-title')}
      content=""
    />
  {/each}
</EventSummaryTable>
