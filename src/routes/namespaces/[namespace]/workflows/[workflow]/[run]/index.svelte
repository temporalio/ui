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
  import { namespace } from '$lib/stores/namespace';
  import { isFullScreen } from '$lib/stores/full-screen';

  import type {
    DescribeWorkflowExecutionResponse,
    GetWorkflowExecutionHistoryResponse,
  } from '$types/temporal/api/workflowservice/v1/request_response';
  import { getContext } from 'svelte';
  import { toWorkflowExecution } from '$lib/models/workflow-execution';
  import CodeBlock from '$lib/components/code-block.svelte';
  import { getTaskQueueUrl } from '$lib/utilities/get-task-queue-url';
  import ExecutionInformation from './_execution-information.svelte';
  import TaskQueueInformation from './_task-queue-information.svelte';
  import PendingActivities from './_pending-activities.svelte';
  import { getWorkflowStartedAndCompletedEvents } from '$lib/utilities/get-started-and-completed-events';

  export let execution: DescribeWorkflowExecutionResponse;
  export let events: GetWorkflowExecutionHistoryResponse;

  $: workflow = toWorkflowExecution(execution);
  $: inputAndResults = getWorkflowStartedAndCompletedEvents(events);
  $: pendingActivities = workflow.pendingActivities;
  $: href = getTaskQueueUrl($namespace, workflow.taskQueue);
</script>

<div class="execution-information px-6 py-6 flex flex-col">
  <div class={$isFullScreen ? 'w-1/3' : 'w-full'}>
    <ExecutionInformation title="Start Time" value={workflow.startTime} />
    <ExecutionInformation title="End Time" value={workflow.endTime} />
    <TaskQueueInformation
      title="Task Queue"
      value={workflow.taskQueue}
      {href}
    />
    {#if inputAndResults.input}
      <CodeBlock heading="Input" content={inputAndResults.input.toString()} />
    {/if}
    {#if inputAndResults.result}
      <CodeBlock heading="Result" content={inputAndResults.result.toString()} />
    {/if}
    <ExecutionInformation
      title="History Events"
      value={workflow.historyEvents}
    />
  </div>
  <div class="pending-activities w-full">
    <PendingActivities activities={pendingActivities} />
  </div>
</div>
