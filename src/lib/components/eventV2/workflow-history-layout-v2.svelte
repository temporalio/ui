<script lang="ts">
  import EventSummaryV2 from '$lib/components/eventV2/event-summary-v2.svelte';
  import WorkflowRelationshipsV2 from '$lib/components/eventV2/workflow-relationships-v2.svelte';
  import { eventHistory } from '$lib/stores/events';
  import { refresh, workflowRun } from '$lib/stores/workflow-run';
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';
  import PageTitle from '$lib/components/page-title.svelte';
  import { page } from '$app/stores';
  import WorkflowOptionsV2 from '$lib/components/eventV2/workflow-options-v2.svelte';
  import { toEventHistory } from '$lib/models/event-history';
  import { isCompletionEvent } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import { authUser } from '$lib/stores/auth-user';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { onDestroy } from 'svelte';
  import EventSummaryTimeline from './event-summary-timeline.svelte';
  import type { CommonHistoryEvent, EventView } from '$lib/types/events';
  import debounce from 'just-debounce';
  import EventSummaryHierarchy from './event-summary-hierarchy.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import { eventViewType, expandAllEvents } from '$lib/stores/event-view';
  import Pagination from '$lib/holocene/pagination.svelte';
  import EventSummaryTable from '../event/event-summary-table.svelte';
  import EventSummaryRow from '../event/event-summary-row.svelte';
  import EventEmptyRow from '../event/event-empty-row.svelte';
  import { namespaces } from '$lib/stores/namespaces';

  let controller;

  $: ({ namespace, workflow: workflowId, run: runId } = $page.params);
  $: ({ workflow } = $workflowRun);

  $: workflowRelationships = getWorkflowRelationships(
    workflow,
    $eventHistory,
    fullHistory,
    $namespaces,
  );

  let fullHistory: CommonHistoryEvent[] = [];

  let showNonCompleted = false;
  let expandAll = false;
  let showWorkflowTasks = false;

  const setFullHistory = async (events) => {
    const { settings } = $page.data;
    const newHistory = await toEventHistory({
      response: events.slice(fullHistory.length),
      namespace,
      settings,
      accessToken: $authUser?.accessToken,
    });
    fullHistory = [...fullHistory, ...newHistory];
    const lastEvent = events[events.length - 1];
    if (isCompletionEvent(lastEvent)) {
      $refresh = Date.now();
    }
  };

  const debounceSetFullHistory = debounce(async (events) => {
    setFullHistory(events);
  }, 250);

  const onUpdate = async ({ history }) => {
    const { events } = history;
    if (!fullHistory.length && events.length) {
      setFullHistory(events);
    } else if (events.length > fullHistory.length) {
      debounceSetFullHistory(events);
    }
  };

  const fetchEvents = async (
    namespace: string,
    workflowId: string,
    runId: string,
  ) => {
    controller = new AbortController();
    const signal = controller.signal;
    const { settings } = $page.data;
    fetchAllEvents({
      namespace,
      workflowId,
      runId,
      settings,
      params: { waitNewEvent: 'true' },
      accessToken: $authUser?.accessToken,
      sort: 'ascending',
      onUpdate,
      signal,
    });
  };

  $: fetchEvents(namespace, workflowId, runId);

  onDestroy(() => {
    controller.abort();
  });

  let showCompleted = false;
</script>

<PageTitle
  title={`Workflow History | ${workflow.runId}`}
  url={$page.url.href}
/>
<div class="flex flex-col gap-4">
  <WorkflowRelationshipsV2 {...workflowRelationships} />
  <EventSummaryTimeline
    {fullHistory}
    {showCompleted}
    onShowCompletedToggle={() => (showCompleted = !showCompleted)}
  />
  <WorkflowOptionsV2
    {showWorkflowTasks}
    {showNonCompleted}
    {expandAll}
    onExpandClick={() => (expandAll = !expandAll)}
    onAdvancedClick={() => (showWorkflowTasks = !showWorkflowTasks)}
  />
  <EventSummaryV2
    {fullHistory}
    {showCompleted}
    {showNonCompleted}
    {expandAll}
    {showWorkflowTasks}
  />
</div>
