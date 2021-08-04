<script context="module" lang="ts">
  import type {
    DescribeWorkflowExecutionResponse,
    GetWorkflowExecutionHistoryResponse,
  } from '$types/temporal/api/workflowservice/v1/request_response';
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ fetch, page }: LoadInput) {
    const { workflow: id, run } = page.params;

    const execution: DescribeWorkflowExecutionResponse = await fetch(
      `http://localhost:8080/api/v1/namespaces/default/workflows/${id}/executions/${run}`,
    )
      .then((response) => response.json())
      .catch(console.error);

    const events: GetWorkflowExecutionHistoryResponse = await fetch(
      `http://localhost:8080/api/v1/namespaces/default/workflows/${id}/executions/${run}/events`,
    )
      .then((response) => response.json())
      .catch(console.error);

    return {
      props: {
        execution,
        events,
      },
    };
  }
</script>

<script lang="typescript">
  import { isFullScreen } from '$lib/stores/full-screen';

  import { WorkflowExecutionResponse } from '$lib/models/workflow-execution';

  import Header from './_header.svelte';
  import ExecutionInformation from './_execution-information.svelte';
  import PendingActivities from './_pending-activities.svelte';
  import Events from './_events.svelte';

  export let execution: DescribeWorkflowExecutionResponse;
  export let events: GetWorkflowExecutionHistoryResponse;

  let { history } = events;

  $: workflow = new WorkflowExecutionResponse(execution);
</script>

<section
  class="flex items-start border-l-2 h-screen"
  class:full={$isFullScreen}
  class:sidebar={!$isFullScreen}
>
  <main class="w-full">
    <Header {workflow} />
    <div class="execution-information px-6 py-6 flex">
      <div class="w-1/3">
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
    {#if $isFullScreen}
      <div class="px-6 py-6">
        <Events {history} />
      </div>
    {/if}
  </main>
</section>

<style>
  .full {
    width: 100%;
  }

  .sidebar {
    width: 600px;
    overflow-y: scroll;
  }

  .full .execution-information {
    flex-direction: row;
    justify-content: space-around;
  }

  .sidebar .execution-information {
    flex-flow: column wrap;
  }
</style>
