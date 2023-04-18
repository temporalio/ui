<script lang="ts">
  import EventSummaryV2 from '$lib/components/eventV2/event-summary-v2.svelte';
  import WorkflowRelationshipsV2 from '$lib/components/eventV2/workflow-relationships-v2.svelte';
  import WorkflowSummaryV2 from '$lib/components/eventV2/workflow-summary-v2.svelte';
  import { eventHistory } from '$lib/stores/events';
  import { refresh, workflowRun } from '$lib/stores/workflow-run';
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';
  import WorkflowWorkersV2 from '$lib/components/eventV2/workflow-workers-v2.svelte';
  import WorkflowStackTraceV2 from '$lib/components/eventV2/workflow-stack-trace-v2.svelte';
  import WorkflowQueryV2 from '$lib/components/eventV2/workflow-query-v2.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
  import { page } from '$app/stores';
  import WorkflowOptionsV2 from '$lib/components/eventV2/workflow-options-v2.svelte';
  import { toEventHistory } from '$lib/models/event-history';
  import { isCompletionEvent } from '$lib/utilities/get-started-completed-and-task-failed-events';
  import { authUser } from '$lib/stores/auth-user';
  import { fetchAllEvents } from '$lib/services/events-service';
  import Accordion from '$lib/holocene/accordion.svelte';
  import { onDestroy } from 'svelte';
  import WorkflowTimeMotion from './workflow-time-motion.svelte';

  let controller;

  $: ({ namespace, workflow: workflowId, run: runId } = $page.params);
  $: ({ workflow } = $workflowRun);
  $: workflowRelationships = getWorkflowRelationships(
    workflow,
    $eventHistory,
    fullHistory,
  );

  let fetchHistory: Promise<CommonHistoryEvent[]>;
  let fullHistory: CommonHistoryEvent[] = [];
  let showNonCompleted = false;
  let expandAll = false;
  let showWorkflowTasks = false;

  const onUpdate = async ({ history }) => {
    const { settings } = $page.data;
    fullHistory = await toEventHistory({
      response: history.events,
      namespace,
      settings,
      accessToken: $authUser?.accessToken,
    });
    const lastEvent = fullHistory[fullHistory.length - 1];
    if (isCompletionEvent(lastEvent)) {
      $refresh = Date.now();
    }
  };

  const onError = () => {
    console.error('Request aborted');
  };

  const fetchEvents = async (
    namespace: string,
    workflowId: string,
    runId: string,
  ) => {
    controller = new AbortController();
    const signal = controller.signal;
    const { settings } = $page.data;
    fetchHistory = fetchAllEvents({
      namespace,
      workflowId,
      runId,
      settings,
      params: { waitNewEvent: 'true' },
      accessToken: $authUser?.accessToken,
      sort: 'ascending',
      onError,
      onUpdate,
      signal,
    });
  };

  $: fetchEvents(namespace, workflowId, runId);

  onDestroy(() => {
    controller.abort();
  });
</script>

<PageTitle
  title={`Workflow History | ${workflow.runId}`}
  url={$page.url.href}
/>
<div class="flex flex-col gap-2">
  <WorkflowSummaryV2 />
  <div class="relative h-96 w-full md:w-1/2 rounded-xl border-4">
    <WorkflowTimeMotion />
  </div>
  <WorkflowRelationshipsV2 {...workflowRelationships} />
</div>
<div class="w-full">
  <WorkflowOptionsV2
    {showWorkflowTasks}
    {showNonCompleted}
    {expandAll}
    onExpandClick={() => (expandAll = !expandAll)}
    onAdvancedClick={() => (showWorkflowTasks = !showWorkflowTasks)}
  />
  <EventSummaryV2
    {fullHistory}
    {showNonCompleted}
    {expandAll}
    {showWorkflowTasks}
  />
</div>
