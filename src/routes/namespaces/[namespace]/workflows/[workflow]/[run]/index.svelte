<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  export async function load({ stuff, page }: LoadInput) {
    const { workflow } = stuff as { workflow: WorkflowExecution };
    const { workflow: executionId, run: runId, namespace } = page.params;

    return {
      props: {
        workflow,
        executionId,
        runId,
        namespace,
      },
    };
  }
</script>

<script lang="ts">
  import { createEventStore } from '$lib/stores/events';
  import { getWorkflowStartedAndCompletedEvents } from '$lib/utilities/get-started-and-completed-events';
  import { getTaskQueueUrl } from '$lib/utilities/get-task-queue-url';

  import ExecutionInformation from './_execution-information.svelte';
  import TaskQueueInformation from './_task-queue-information.svelte';
  import PendingActivities from './_pending-activities.svelte';
  import CodeBlock from '$lib/components/code-block.svelte';
  import TerminateWorkflow from '$lib/components/terminate-workflow.svelte';

  export let workflow: WorkflowExecution;
  export let executionId: string;
  export let runId: string;
  export let namespace: string;

  let eventStore = createEventStore(namespace, executionId, runId);

  $: events = $eventStore.data;
  $: inputAndResults = getWorkflowStartedAndCompletedEvents(events);
  $: pendingActivities = workflow?.pendingActivities;
  $: taskQueue = workflow?.taskQueue;
  $: historyEvents = workflow?.historyEvents;
  $: href = getTaskQueueUrl(namespace, taskQueue);
</script>

<div class="execution-information px-6 py-6">
  <div class="w-full flex">
    <ExecutionInformation title="Start Time" value={workflow.startTime} />
    <ExecutionInformation title="End Time" value={workflow.endTime} />
    <TaskQueueInformation title="Task Queue" value={taskQueue} {href} />
    <ExecutionInformation title="History Events" value={historyEvents} />
    <CodeBlock heading="Input" content={inputAndResults.input} />
    <CodeBlock heading="Result" content={inputAndResults.result} />
  </div>
  <TerminateWorkflow {namespace} {workflow} />
  <div class="flex w-full mt-4">
    <PendingActivities activities={pendingActivities} />
  </div>
</div>
