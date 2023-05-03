<script lang="ts">
  import { workflowRun } from '$lib/stores/workflow-run';
  import Card from '$lib/holocene/card.svelte';
  import type { ChildWorkflowExecutionCompletedEvent } from '$lib/types/events';

  $: ({ workflow, workers } = $workflowRun);

  export let children: ChildWorkflowExecutionCompletedEvent[];
</script>

<div class="flex flex-col gap-2">
  <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
    <Card class="flex flex-col gap-0 text-right">
      <p>Workers</p>
      <h3 class="font-bold">{workers.pollers.length}</h3>
    </Card>
    <Card class="flex flex-col gap-0 text-right">
      <p>Children</p>
      <h3 class="font-bold">
        {workflow?.pendingChildren.length + children.length}
      </h3>
    </Card>
    <Card class="flex flex-col gap-0 text-right">
      <p>Size</p>
      <h3 class="font-bold">{Math.round(parseInt(workflow.size) / 1000)} kb</h3>
    </Card>
    <Card class="flex flex-col gap-0 text-right">
      <p>State Transitions</p>
      <h3 class="font-bold">{workflow?.stateTransitionCount}</h3>
    </Card>
  </div>
</div>
