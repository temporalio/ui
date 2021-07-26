<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import { encodeURISegments } from '$lib/utilities/encode-uri-segments';

  //reused code
  export async function load({ fetch, page }: LoadInput) {
    const { workflow: id, run } = page.params;

    const workflowResponse = await fetch(
      encodeURISegments(`/api/workflows/${id}/${run}`),
    );

    const historyResponse = await fetch(
      encodeURISegments(
        `/api/workflows/${id}/${run}/history?waitForHistory=true`,
      ),
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
    const { details: firstEventDetails } = events[0];
    const firstInput =
      firstEventDetails.input && firstEventDetails.input.payloads;
    const input = lastEventDetails.input && lastEventDetails.input.payloads;
    const result = lastEventDetails.result && lastEventDetails.result.payloads;

    return {
      props: {
        workflow,
        name,
        firstInput,
        workflowId,
        runId,
        events,
        input,
        result,
        workflowUrl: encodeURISegments(`/workflows/${workflowId}/${runId}`),
      },
    };
  }
</script>

<script lang="ts">
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import CodeBlock from '../../workflows/[workflow]/_code-block.svelte';
  import { formatDate } from '$lib/utilities/format-date';

  export let workflow: WorkflowExecutionAPIResponse;
  export let name: string;
  export let workflowId: string;
  export let runId: string;
  export let events: any[];
  export let input: string;
  export let firstInput: string;
  export let result: string;
  export let workflowUrl: string;
</script>

<section class="flex items-start">
  <main>
    <header
      class="border-b-2 border-gray-200 px-6 pb-6 flex flex-col justify-between"
    >
      <h1 class="m-0 mt-6 text-lg">{name}</h1>
      <p class="text-gray-500 text-sm">{workflowId}</p>
      <p class="text-gray-500 text-sm">{runId}</p>
      <a
        class="bg-indigo-500 text-white active:bg-indigo-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
        href={workflowUrl}><button>Contract</button></a
      >
    </header>
    <section class="p-6">
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
      <CodeBlock heading="Input" content={firstInput} />
      <div>
        <h3>History Events</h3>
        <p>{events.length}</p>
      </div>
      <section />
    </section>
  </main>
</section>

<style>
  h3 {
    @apply text-lg;
    @apply mt-6;
    @apply mb-2;
    @apply font-semibold;
  }
</style>
