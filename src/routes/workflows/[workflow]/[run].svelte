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
  import { formatDate } from '$lib/utilities/format-date';

  export let workflow: WorkflowExecutionAPIResponse;
  export let name: string;
  export let workflowId: string;
  export let runId: string;
  export let events: any[];
  export let input: string;
  export let result: string;
</script>

<section>
  <main>
    <header>
      <h1>{name}</h1>
      <p>{workflowId}</p>
      <p>{runId}</p>
    </header>
    <div id="workflow-info">
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
  <a href="/workflows"><button>Close</button></a>
</section>

<style>
  section {
    display: flex;
    flex-flow: column;
    justify-content: space-between;
    min-width: 400px;
    width: 33%;
    border-left: 1px solid #e5e7eb;
    height: 100vh;
  }

  a {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    width: 100%;
    background-color: red;
    color: white;
  }

  header {
    padding: 24px 16px;
    border-bottom: 1px solid #e5e7eb;
  }

  #workflow-info {
    margin-top: 10px;
  }

  header h1 {
    font-size: 18px;
    font-weight: 500;
    line-height: 24px;
    margin: 0;
  }

  header p {
    color: #6b7280;
    font-size: 14px;
    line-height: 20px;
    margin: 0;
  }

  main {
    padding: 24px 16px;
  }
</style>
