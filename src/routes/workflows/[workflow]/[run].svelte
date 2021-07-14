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

    return {
      props: {
        name,
        workflowId,
        runId,
      },
    };
  }
</script>

<script lang="ts">
  export const name;
  export const workflowId;
  export const runId;
</script>

<section>
  <h1>{name}</h1>
  <p>{runId}</p>
  <p>
    <a href="/workflows">Close</a>
  </p>
</section>

<style>
  section {
    min-width: 400px;
    width: 33%;
    padding: 1em;
  }
</style>
