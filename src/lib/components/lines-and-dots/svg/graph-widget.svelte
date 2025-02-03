<script lang="ts">
  import { groupEvents } from '$lib/models/event-groups';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import type { WorkflowEvents } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import TimelineGraph from './timeline-graph.svelte';

  export let namespace: string;
  export let workflowId: string;
  export let runId = '';
  export let viewportHeight = 360;
  export let onLoad: () => void = () => {};

  const getWorkflowAndEventHistory = async () => {
    const [workflow, history] = await Promise.all([
      fetchWorkflow({ namespace, workflowId, runId }),
      fetchAllEvents({ namespace, workflowId, runId }),
    ]);
    return { workflow: workflow.workflow, history };
  };

  const createGroups = (
    workflow: WorkflowExecution,
    history: WorkflowEvents,
  ) => {
    const pendingActivities = workflow?.pendingActivities ?? [];
    onLoad();
    return groupEvents(history, 'ascending', pendingActivities);
  };
</script>

{#await getWorkflowAndEventHistory() then { workflow, history }}
  <div class="cursor-pointer overflow-auto {$$restProps.class}">
    <TimelineGraph
      {viewportHeight}
      {workflow}
      groups={createGroups(workflow, history)}
      readOnly
    />
  </div>
{/await}
