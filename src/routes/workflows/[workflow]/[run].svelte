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
  import Icon, { X, ArrowsExpand } from 'svelte-hero-icons';
  import { page } from '$app/stores';

  export let execution: DescribeWorkflowExecutionResponse;

  $: name = execution.workflowExecutionInfo.type.name;
  $: workflowId = execution.workflowExecutionInfo.execution.workflowId;
  $: runId = execution.workflowExecutionInfo.execution.runId;
  $: workflowUrl = `/workflows/${workflowId}/${runId}?${new URLSearchParams({
    fullScreen: !$isFullScreen,
  })}`;
</script>

<section
  class="flex items-start border-l-2 h-screen w-1/3"
  class:full={$isFullScreen}
>
  <main class="w-full">
    <header
      class="border-b-2 border-gray-200 px-6 pb-6 flex flex-col justify-between"
    >
      <a href={workflowUrl}>
        <Icon
          src={ArrowsExpand}
          class="absolute right-10 top-2 w-8 h-8 text-gray-400"
        />
      </a>
      <a href="/workflows">
        <Icon src={X} class="absolute right-2 top-2 w-8 h-8 text-gray-400" />
      </a>
      <h1 class="m-0 mt-6 text-lg">
        {name}
      </h1>
      <p class="text-gray-500 text-sm">
        {workflowId}
      </p>
      <p class="text-gray-500 text-sm">
        {runId}
      </p>
    </header>
  </main>
</section>

<style>
  .full {
    width: 100%;
  }
</style>
