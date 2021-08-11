<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ context }: LoadInput) {
    const { execution } = context;

    return {
      props: {
        execution,
      },
    };
  }
</script>

<script lang="typescript">
  import { isFullScreen } from '$lib/stores/full-screen';

  import type { DescribeWorkflowExecutionResponse } from '$types/temporal/api/workflowservice/v1/request_response';

  import { toWorkflowExecution } from '$lib/models/workflow-execution';

  import ExecutionInformation from './_execution-information.svelte';
  import PendingActivities from './_pending-activities.svelte';

  export let execution: DescribeWorkflowExecutionResponse;

  $: workflow = toWorkflowExecution(execution);
</script>

<div class="execution-information px-6 py-6">
  <div class="w-full flex">
    <ExecutionInformation title="Start Time" value={workflow.startTime} />
    <ExecutionInformation title="End Time" value={workflow.endTime} />
    <ExecutionInformation title="Task Queue" value={workflow.taskQueue} />
    <ExecutionInformation
      title="History Events"
      value={workflow.historyEvents}
    />
  </div>
  <div class="pending-activities w-full">
    <PendingActivities activities={workflow.pendingActivities} />
  </div>
</div>
