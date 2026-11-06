<script lang="ts">
  import { page } from '$app/state';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { eventCategoryFilter } from '$lib/stores/filters';
  import { importEventGroups, importEvents } from '$lib/stores/import-events';
  import type { WorkflowExecutionIdentity } from '$lib/types/workflows';
  import { isWorkflowExecutionStartedEvent } from '$lib/utilities/is-event-type';

  const workflowExecutionIdentity: WorkflowExecutionIdentity = $derived({
    namespace: page.params.namespace,
    workflowId: page.params.workflow,
    runId: page.params.run,
  });

  const sortedEvents = $derived(
    $eventFilterSort === 'descending'
      ? [...$importEventGroups].reverse()
      : $importEventGroups,
  );
  const filteredEventGroups = $derived(
    sortedEvents.filter((event: EventGroup) => {
      if ($eventCategoryFilter)
        return $eventCategoryFilter.includes(event.category);
      return event;
    }),
  );
</script>

<EventSummaryTable
  initialEvent={$importEvents.find(isWorkflowExecutionStartedEvent)}
  items={filteredEventGroups}
  groups={filteredEventGroups}
  {workflowExecutionIdentity}
/>
