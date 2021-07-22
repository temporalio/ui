<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ fetch, page }: LoadInput) {
    const { workflow: id, run } = page.params;

    // TODO: Make these concurrent. This can wait until we implement the Redux store.
    const workflowResponse = await fetch(`/api/workflows/${id}/${run}`);
    const historyResponse = await fetch(
      `/api/workflows/${id}/${run}/history?waitForHistory=true`,
    );

    if (!workflowResponse.ok) {
      const message = `An error has occured: ${workflowResponse.status}`;
      throw new Error(message);
    }

    if (!historyResponse.ok) {
      const message = `An error has occured: ${historyResponse.status}`;
      throw new Error(message);
    }

    const { workflowExecutionInfo: workflow } = await workflowResponse.json();
    const { history } = await historyResponse.json();

    const { type, execution } = workflow;
    const { events } = history;

    const { name } = type;
    const { workflowId, runId } = execution;

    const { details: lastEventDetails } = events[events.length - 1];
    const input = lastEventDetails.input && lastEventDetails.input.payloads;
    const result = lastEventDetails.result && lastEventDetails.result.payloads;

    return {
      props: {
        workflow,
        name,
        workflowId,
        runId,
        events,
        input,
        result,
      },
    };
  }
</script>

<script lang="ts">
  import CodeBlock from './_code-block.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';

  import { formatDate } from '$lib/utilities/format-date';

  export let workflow: WorkflowExecutionAPIResponse;
  export let name: string;
  export let workflowId: string;
  export let runId: string;
  export let events: any[];
  export let input: string;
  export let result: string;
</script>

<section
  class="border-l-2 border-gray-200 h-screen flex flex-col justify-between"
>
  <main class="p-6">
    <header class="border-b-2 border-gray-200 p-6">
      <h1 class="m-0 text-lg">{name}</h1>
      <p class="text-gray-500 text-sm">{workflowId}</p>
      <p class="text-gray-500 text-sm">{runId}</p>
    </header>
    <div class="m-4">
      <WorkflowStatus status={workflow.status} />
    </div>
    <div>
      <h3>Start Time</h3>
      <p>{formatDate(workflow.startTime)}</p>
    </div>
    <div>
      <h3>End Time</h3>
      {#if workflow.closeTime}
        <p>{formatDate(workflow.closeTime)}</p>
      {:else}
        <p>Still running…</p>
      {/if}
    </div>
    <div>
      <h3>Task Queue</h3>
      <p>{workflow.taskQueue || '(None)'}</p>
    </div>
    <div>
      <h3>History Events</h3>
      <p>{events.length}</p>
    </div>
    <CodeBlock heading="Input" content={input} />
    <CodeBlock heading="Result" content={result} />
  </main>
  <a
    class="w-full bg-red-500 h-14 flex justify-center text-white"
    href="/workflows"><button>Close</button></a
  >
</section>

<style>
  h3 {
    @apply text-lg;
    @apply mt-6;
    @apply mb-2;
    @apply font-semibold;
  }
</style>
