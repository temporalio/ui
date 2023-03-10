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

  $: ({ namespace, workflow: workflowId, run: runId } = $page.params);
  $: ({ workflow } = $workflowRun);
  $: workflowRelationships = getWorkflowRelationships(workflow, $eventHistory);

  let fullHistory: CommonHistoryEvent[] = [];
  let debugMode = false;

  const resetFullHistory = () => {
    fullHistory = [];
  };

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

  const fetchEvents = async (
    namespace: string,
    workflowId: string,
    runId: string,
  ) => {
    const { settings } = $page.data;
    resetFullHistory();
    fetchAllEvents({
      namespace,
      workflowId,
      runId,
      settings,
      params: { waitNewEvent: 'true' },
      accessToken: $authUser?.accessToken,
      sort: 'ascending',
      onUpdate,
    });
  };

  $: fetchEvents(namespace, workflowId, runId);
</script>

<PageTitle
  title={`Workflow History | ${workflow.runId}`}
  url={$page.url.href}
/>
<div class="flex flex-col gap-2 xl:flex-row-reverse">
  <div class="flex w-full flex-col gap-2 xl:w-1/3">
    <WorkflowSummaryV2 />
    <WorkflowRelationshipsV2 {...workflowRelationships} />
    <WorkflowWorkersV2 taskQueue={workflow.taskQueue} />
    <WorkflowStackTraceV2 />
    <WorkflowQueryV2 />
    <WorkflowOptionsV2 onDebugClick={() => (debugMode = !debugMode)} />
  </div>
  <div class="w-full xl:w-2/3">
    <EventSummaryV2 {fullHistory} {debugMode} />
  </div>
</div>
