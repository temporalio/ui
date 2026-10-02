<script lang="ts">
  import type { ExecutionIdentity } from './data/identity-keys';

  import WorkflowTimelineLayout from './timeline/workflow-timeline-layout.svelte';
  import { useWorkflowView } from './use-workflow-view.svelte';

  let { identity }: { identity: ExecutionIdentity } = $props();

  const workflowView = useWorkflowView(() => identity);
</script>

<WorkflowTimelineLayout {identity} {workflowView} />
