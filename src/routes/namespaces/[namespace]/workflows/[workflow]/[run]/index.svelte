<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ page }: LoadInput) {
    const { workflow: executionId, run: runId, namespace } = page.params;

    return {
      props: {
        executionId,
        runId,
        namespace,
      },
    };
  }
</script>

<script lang="ts">
  import { isFullScreen } from '$lib/stores/full-screen';

  import CodeBlock from '$lib/components/code-block.svelte';
  import { getTaskQueueUrl } from '$lib/utilities/get-task-queue-url';
  import ExecutionInformation from './_execution-information.svelte';
  import TaskQueueInformation from './_task-queue-information.svelte';
  import PendingActivities from './_pending-activities.svelte';
  import { getWorkflowStartedAndCompletedEvents } from '$lib/utilities/get-started-and-completed-events';
  import { getWorkflow } from '$lib/stores/workflow';
  import { createEventStore } from '$lib/stores/events';

  export let executionId: string;
  export let runId: string;
  export let namespace: string;

  let workflowStore = getWorkflow({ executionId, runId, namespace });
  let eventStore = createEventStore(namespace, executionId, runId);

  $: workflow = $workflowStore.data;
  $: loading = $workflowStore.loading;
  $: events = $eventStore.data;
  $: inputAndResults = getWorkflowStartedAndCompletedEvents(events);
  $: pendingActivities = workflow?.pendingActivities;
  $: href = getTaskQueueUrl(namespace, workflow?.taskQueue);
</script>

<div class="execution-information px-6 py-6 flex flex-col">
  {#if !loading}
    <div class={$isFullScreen ? 'w-1/3' : 'w-full'}>
      <ExecutionInformation title="Start Time" value={workflow.startTime} />
      <ExecutionInformation title="End Time" value={workflow.endTime} />
      <TaskQueueInformation
        title="Task Queue"
        value={workflow.taskQueue}
        {href}
      />
      <CodeBlock heading="Input" content={inputAndResults.input} />
      <CodeBlock heading="Result" content={inputAndResults.result} />
      <ExecutionInformation
        title="History Events"
        value={workflow.historyEvents}
      />
    </div>
    <div class="pending-activities w-full">
      <PendingActivities activities={pendingActivities} />
    </div>
  {/if}
</div>
