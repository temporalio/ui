<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ context }: LoadInput) {
    const { execution, events } = context;

    return {
      props: {
        execution,
        events,
      },
    };
  }
</script>

<script lang="typescript">
  import type { DescribeWorkflowExecutionResponse } from '$types/temporal/api/workflowservice/v1/request_response';
  import type { GetWorkflowExecutionHistoryResponse } from '$types/temporal/api/workflowservice/v1/request_response';

  import { toWorkflowExecution } from '$lib/models/workflow-execution';
  import { getWorkflowStartedAndCompletedEvents } from '$lib/utilities/get-started-and-completed-events';

  import ExecutionInformation from './_execution-information.svelte';
  import PendingActivities from './_pending-activities.svelte';
  import CodeBlock from '$lib/components/code-block.svelte';

  export let execution: DescribeWorkflowExecutionResponse;
  export let events: GetWorkflowExecutionHistoryResponse;

  $: workflow = toWorkflowExecution(execution);
  $: inputAndResults = getWorkflowStartedAndCompletedEvents(events);
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
    {#if inputAndResults.input}
      <CodeBlock heading="Input" content={inputAndResults.input.toString()} />
    {/if}
    {#if inputAndResults.result}
      <CodeBlock heading="Result" content={inputAndResults.result.toString()} />
    {/if}
  </div>
  <div class="flex w-full">
    <PendingActivities activities={workflow.pendingActivities} />
  </div>
</div>
