<script context="module">
  export async function load({ fetch, page }) {
    const { workflow: id, run } = page.params;
    const workflowResponse = await fetch(`/api/workflows/${id}/${run}`);
    const historyResponse = await fetch(
      `/api/workflows/${id}/${run}/history?waitForHistory=true`,
    );

    if (!workflowResponse.ok) {
      const message = `An error has occured: ${workflowResponse.status}`;
      throw new Error(message);
    }

    if (!historyResponse.ok) {
      const message = `An error has occured: ${workflowResponse.status}`;
      throw new Error(message);
    }

    const workflow = await workflowResponse.json();
    const { history } = await historyResponse.json();

    const name = workflow.workflowExecutionInfo.type.name;
    const workflowId = workflow.workflowExecutionInfo.execution.workflowId;
    const runId = workflow.workflowExecutionInfo.execution.runId;
    const events = history.events;

    const lastEvent = events[events.length - 1];
    const input = lastEvent.details.input && lastEvent.details.input.payloads;
    const result =
      lastEvent.details.result && lastEvent.details.result.payloads;

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

  export let workflow;
  export let name;
  export let workflowId;
  export let runId;
  export let events;
  export let input;
  export let result;
</script>

<section>
  <header>
    <h1>{name}</h1>
    <p>{runId}</p>
  </header>
  <main>
    <h3>Start Time</h3>
    <p>{formatDate(workflow.workflowExecutionInfo.startTime)}</p>
    <h3>End Time</h3>
    {#if workflow.workflowExecutionInfo.closeTime}
      <p>{formatDate(workflow.workflowExecutionInfo.closeTime)}</p>
    {:else}
      <p>Still running…</p>
    {/if}
    <h3>Task Queue</h3>
    <p>{workflow.workflowExecutionInfo.taskQueue || '(None)'}</p>
    <h3>History Events</h3>
    <p>{events.length}</p>
    <CodeBlock heading="Input" content={input} />
    <CodeBlock heading="Result" content={result} />
  </main>
</section>

<style>
  section {
    min-width: 400px;
    width: 33%;
    border-left: 1px solid #e5e7eb;
    height: 100vh;
  }

  header {
    padding: 24px 16px;
    border-bottom: 1px solid #e5e7eb;
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
