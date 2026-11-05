<script lang="ts">
  import { page } from '$app/state';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import { eventFilterSort } from '$lib/stores/event-view';
  import { eventCategoryFilter } from '$lib/stores/filters';
  import { importEvents } from '$lib/stores/import-events';
  import type { WorkflowEvent } from '$lib/types/events';
  import type { WorkflowExecutionIdentity } from '$lib/types/workflows';

  const workflowExecutionIdentity: WorkflowExecutionIdentity = $derived({
    namespace: page.params.namespace,
    workflowId: page.params.workflow,
    runId: page.params.run,
  });

  const sortedEvents = $derived(
    $eventFilterSort === 'descending'
      ? [...$importEvents].reverse()
      : $importEvents,
  );
  const filteredEvents = $derived(
    sortedEvents.filter((event: WorkflowEvent) => {
      if ($eventCategoryFilter)
        return $eventCategoryFilter.includes(event.category);
      return event;
    }),
  );
</script>

<EventSummaryTable items={filteredEvents} {workflowExecutionIdentity} />
