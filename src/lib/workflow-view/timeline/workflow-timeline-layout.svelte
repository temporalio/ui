<script lang="ts">
  import {
    type ExecutionIdentity,
    getExecutionKey,
  } from '../data/identity-keys';
  import type { WorkflowView } from '../use-workflow-view.svelte';
  import { projectWorkflowScene } from './scene/structure/project-workflow-scene';

  import WorkflowTimelinePlot from './scene/plot/workflow-timeline-plot.svelte';
  import { useWorkflowTimeline } from './use-workflow-timeline.svelte';

  let {
    identity,
    workflowView,
  }: { identity: ExecutionIdentity; workflowView: WorkflowView } = $props();

  // svelte-ignore state_referenced_locally
  const timeline = useWorkflowTimeline(workflowView);
  const rootExecutionKey = $derived(getExecutionKey(identity));
  const scene = $derived(
    projectWorkflowScene(
      workflowView.executionGraph,
      timeline.timelineRows,
      rootExecutionKey,
    ),
  );
</script>

<div class="timeline-layout" data-testid="new-workflow-timeline">
  {#key rootExecutionKey}
    <WorkflowTimelinePlot
      {scene}
      historyEvents={workflowView.historyEvents}
      executionHistories={workflowView.executionHistories}
      onrequesthistory={workflowView.requestExecution}
    />
  {/key}
</div>

<style>
  .timeline-layout {
    display: flex;
    flex: none;
    width: 100%;
    min-width: 0;
    min-height: 0;
  }
</style>
