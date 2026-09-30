<script>
  import { WorkflowHistory, WorkflowStatus } from '@forkbombeu/temporal-ui';

  import events from '$lib/fixtures/raw-events.ascending.completed.json';
  import execution from '$lib/fixtures/workflow.completed.json';

  const history = events.history.events;
  const status = execution.workflowExecutionInfo.status;
</script>

<main class="space-y-4 p-4">
  <WorkflowStatus {status} />
  <WorkflowHistory {execution} {history} namespace="default" />
</main>
