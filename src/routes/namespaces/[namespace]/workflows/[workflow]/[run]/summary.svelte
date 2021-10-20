<script context="module" lang="ts">
  import { namespace } from '$lib/stores/namespace';
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ stuff }: LoadInput) {
    const { execution, events } = stuff;

    return {
      props: {
        execution,
        events,
      },
    };
  }
</script>

<script lang="ts">
  import type {
    GetWorkflowExecutionHistoryResponse,
    DescribeWorkflowExecutionResponse,
  } from '$types';

  import { toWorkflowExecution } from '$lib/models/workflow-execution';
  import { getWorkflowStartedAndCompletedEvents } from '$lib/utilities/get-started-and-completed-events';
  import { getTaskQueueUrl } from '$lib/utilities/get-task-queue-url';

  import ExecutionInformation from './_execution-information.svelte';
  import TaskQueueInformation from './_task-queue-information.svelte';
  import PendingActivities from './_pending-activities.svelte';
  import CodeBlock from '$lib/components/code-block.svelte';
  import TerminateWorkflow from '$lib/components/terminate-workflow.svelte';

  export let execution: DescribeWorkflowExecutionResponse;
  export let events: GetWorkflowExecutionHistoryResponse;

  $: workflow = toWorkflowExecution(execution);
  $: inputAndResults = getWorkflowStartedAndCompletedEvents(events);
  $: href = getTaskQueueUrl($namespace, workflow.taskQueue);
</script>

<div class="execution-information px-6 py-6">
  <div class="w-full flex">
    <ExecutionInformation title="Start Time" value={workflow.startTime} />
    <ExecutionInformation title="End Time" value={workflow.endTime} />
    <TaskQueueInformation
      title="Task Queue"
      value={workflow.taskQueue}
      {href}
    />
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
  <TerminateWorkflow namespace={$namespace} {workflow} />
  <div class="flex w-full mt-4">
    <PendingActivities activities={workflow.pendingActivities} />
  </div>
</div>
