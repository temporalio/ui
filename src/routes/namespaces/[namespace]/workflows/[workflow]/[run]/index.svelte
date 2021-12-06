<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  export async function load({ stuff, page }: LoadInput) {
    const { workflow, events } = stuff as {
      workflow: WorkflowExecution;
      events: HistoryEvent[];
    };
    const { namespace } = page.params;

    return {
      props: {
        workflow,
        events,
        namespace,
      },
    };
  }
</script>

<script lang="ts">
  import { getWorkflowStartedAndCompletedEvents } from '$lib/utilities/get-started-and-completed-events';
  import { getTaskQueueUrl } from '$lib/utilities/get-task-queue-url';

  import ExecutionInformation from './_execution-information.svelte';
  import TaskQueueInformation from './_task-queue-information.svelte';
  import PendingActivities from './_pending-activities.svelte';
  import CodeBlock from '$lib/components/code-block.svelte';
  import TerminateWorkflow from '$lib/components/terminate-workflow.svelte';
  import Event from './_event.svelte';

  export let workflow: WorkflowExecution;
  export let events: HistoryEvent[];
  export let namespace: string;

  let format: EventFormat = 'grid';

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
  <section>
    {#if format === 'grid'}
      <table class="border-collapse w-full border-2 table-fixed">
        <thead>
          <tr>
            <th class="w-1/12">ID</th>
            <th class="w-2/12">Type</th>
            <th class="w-2/12">Time</th>
            <th class="w-7/12">Details</th>
          </tr>
        </thead>
        <tbody>
          {#each events as event, index}
            <Event {event} {index} />
          {/each}
        </tbody>
      </table>
    {/if}

    {#if format === 'json'}
      {#each events as event}
        <CodeBlock heading={`Event ID: ${event.eventId}`} content={event} />
      {/each}
    {/if}
  </section>
</div>
