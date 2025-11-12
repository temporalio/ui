import { get } from 'svelte/store';

import { groupEvents } from '$lib/models/event-groups';
import { type EventSortOrder } from '$lib/stores/event-view';
import { currentEventHistory } from '$lib/stores/events';
import type { WorkflowEvents } from '$lib/types/events';
import type { WorkflowExecution } from '$lib/types/workflows';
import { getWorkflowTaskFailedEvent } from '$lib/utilities/get-workflow-task-failed-event';

export const workflowHistoryInformation = (
  workflow: WorkflowExecution,
  filteredHistory: WorkflowEvents,
  sortOrder: EventSortOrder,
) => {
  const reverseSort = $derived(sortOrder === 'descending');
  const pendingActivities = $derived(workflow?.pendingActivities);
  const pendingNexusOperations = $derived(workflow?.pendingNexusOperations);
  const ascendingGroups = $derived(
    groupEvents(
      filteredHistory,
      'ascending',
      pendingActivities,
      pendingNexusOperations,
    ),
  );

  const groups = $derived(
    reverseSort ? [...ascendingGroups].reverse() : ascendingGroups,
  );
  const history = $derived(
    reverseSort ? [...filteredHistory].reverse() : filteredHistory,
  );
  const workflowTaskFailedError = $derived(
    getWorkflowTaskFailedEvent(get(currentEventHistory), 'ascending'),
  );

  return {
    workflow,
    reverseSort,
    pendingActivities,
    pendingNexusOperations,
    groups,
    history,
    workflowTaskFailedError,
  };
};
