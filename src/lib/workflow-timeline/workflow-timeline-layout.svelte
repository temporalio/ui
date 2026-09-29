<script lang="ts">
  import {
    type ExecutionIdentity,
    getExecutionKey,
  } from './data/identity-keys';
  import { flattenWorkflowScene } from './scene/structure/flatten-workflow-scene';
  import { projectWorkflowScene } from './scene/structure/project-workflow-scene';

  import WorkflowTimelinePlot from './scene/plot/workflow-timeline-plot.svelte';
  import { useWorkflowTimeline } from './use-workflow-timeline.svelte';

  let { identity }: { identity: ExecutionIdentity } = $props();

  const timeline = useWorkflowTimeline(() => identity);
  const rootExecutionKey = $derived(getExecutionKey(identity));
  const scene = $derived(
    projectWorkflowScene(
      timeline.executionGraph,
      timeline.timelineRows,
      rootExecutionKey,
    ),
  );
  const flatRows = $derived(
    scene ? flattenWorkflowScene(scene, rootExecutionKey) : [],
  );
</script>

<div class="timeline-layout" data-testid="new-workflow-timeline">
  <WorkflowTimelinePlot rows={flatRows} />
</div>

<style>
  .timeline-layout {
    display: flex;
    flex: 1;
    width: 100%;
    min-width: 0;
    min-height: 0;
  }
</style>
