<script lang="ts">
  import EventSummaryV2 from '$lib/components/eventV2/event-summary-v2.svelte';
  import WorkflowRelationshipsV2 from '$lib/components/eventV2/workflow-relationships-v2.svelte';
  import WorkflowStatCards from '$lib/components/eventV2/workflow-workers-v2.svelte';
  import WorkflowSummaryV2 from '$lib/components/eventV2/workflow-summary-v2.svelte';
  import WorkflowRelationships from '$lib/components/workflow/workflow-relationships.svelte';
  import { eventHistory } from '$lib/stores/events';
  import { workflowRun } from '$lib/stores/workflow-run';
  import { getWorkflowRelationships } from '$lib/utilities/get-workflow-relationships';
  import WorkflowWorkersV2 from '$lib/components/eventV2/workflow-workers-v2.svelte';
  import WorkflowStackTraceV2 from '$lib/components/eventV2/workflow-stack-trace-v2.svelte';
  import WorkflowQueryV2 from '$lib/components/eventV2/workflow-query-v2.svelte';

  $: ({ workflow } = $workflowRun);
  $: workflowRelationships = getWorkflowRelationships(workflow, $eventHistory);
</script>

<div class="flex flex-col xl:flex-row-reverse gap-2">
  <div class="w-full xl:w-1/3 flex flex-col gap-2">
    <WorkflowSummaryV2 />
    <WorkflowRelationshipsV2 {...workflowRelationships} />
    <WorkflowWorkersV2 taskQueue={workflow.taskQueue} />
    <WorkflowStackTraceV2 />
    <WorkflowQueryV2 />
  </div>
  <div class="w-full xl:w-2/3">
    <EventSummaryV2 />
  </div>
</div>
