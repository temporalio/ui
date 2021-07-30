<script context="module" lang="ts">
  import type { DescribeWorkflowExecutionResponse } from '$types/temporal/api/workflowservice/v1/request_response';
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ fetch, page }: LoadInput) {
    const { workflow: id, run } = page.params;

    const execution: DescribeWorkflowExecutionResponse = await fetch(
      `http://localhost:8080/api/v1/namespaces/default/workflows/${id}/executions/${run}`,
    )
      .then((response) => response.json())
      .catch(console.error);

    return {
      props: {
        execution,
      },
    };
  }
</script>

<script lang="typescript">
  import { isFullScreen } from '$lib/stores/full-screen';
  import { page } from '$app/stores';

  import { WorkflowExecutionResponse } from '$lib/models/workflow-execution.ts';

  import Header from './_header.svelte';
  import ExecutionInformation from './_execution-information.svelte';

  export let execution: DescribeWorkflowExecutionResponse;

  $: workflow = new WorkflowExecutionResponse(execution);
</script>

<section
  class="flex items-start border-l-2 h-screen"
  class:full={$isFullScreen}
  class:sidebar={!$isFullScreen}
>
  <main class="w-full">
    <Header {workflow} />
    <div class="px-6 py-6">
      <div class="execution-information flex">
        <ExecutionInformation title="Start Time" value={workflow.startTime} />
        <ExecutionInformation title="End Time" value={workflow.endTime} />
        <ExecutionInformation title="Task Queue" value={workflow.taskQueue} />
        <ExecutionInformation
          title="History Events"
          value={workflow.historyEvents}
        />
      </div>
    </div>
  </main>
</section>

<style>
  .full {
    width: 100%;
  }

  .sidebar {
    width: 600px;
  }

  .full .execution-information {
    flex-direction: row;
    justify-content: space-around;
  }

  .sidebar .execution-information {
    flex-flow: column wrap;
  }
</style>
