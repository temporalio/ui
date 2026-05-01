<script lang="ts">
  import { groupEvents } from '$lib/models/event-groups';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import type { WorkflowEvents } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import TimelineGraph from './timeline-graph.svelte';

  interface Props {
    namespace: string;
    workflowId: string;
    runId?: string;
    viewportHeight?: number;
    onLoad?: () => void;
    class?: string;
  }

  let {
    namespace,
    workflowId,
    runId = '',
    viewportHeight = 360,
    onLoad = () => {},
    class: className = '',
  }: Props = $props();

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
    onLoad();
    const pendingActivities = workflow?.pendingActivities ?? [];
    return groupEvents(history, 'ascending', pendingActivities);
  };
</script>

{#await getWorkflowAndEventHistory() then { workflow, history }}
  <div class="cursor-pointer overflow-auto {className}">
    <TimelineGraph
      {viewportHeight}
      {workflow}
      groups={createGroups(workflow, history)}
      readOnly
    />
  </div>
{/await}
