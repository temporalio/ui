<script lang="ts">
  import { groupEvents } from '$lib/models/event-groups';
  import { fetchAllEvents } from '$lib/services/events-service';
  import { fetchWorkflow } from '$lib/services/workflow-service';
  import type { EventView, WorkflowEvents } from '$lib/types/events';
  import type { WorkflowExecution } from '$lib/types/workflows';

  import CompactGraph from './compact-graph.svelte';
  import HistoryGraph from './history-graph.svelte';
  import TimelineGraph from './timeline-graph.svelte';

  export let namespace: string;
  export let workflowId: string;
  export let runId = '';
  export let height = 400;
  export let width: number;
  export let view: EventView = 'timeline';

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
    return groupEvents(history, 'ascending', pendingActivities);
  };

  const views = {
    compact: CompactGraph,
    timeline: TimelineGraph,
    history: HistoryGraph,
    json: HistoryGraph,
  };
</script>

{#await getWorkflowAndEventHistory() then { workflow, history }}
  <div
    class="cursor-pointer overflow-auto {$$restProps.class}"
    style="height: {height}px;"
  >
    <svelte:component
      this={views[view]}
      {workflow}
      {history}
      groups={createGroups(workflow, history)}
      canvasWidth={width}
      readOnly
    />
  </div>
{/await}
