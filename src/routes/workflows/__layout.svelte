<script context="module">
  import { subDays, addDays } from 'date-fns';

  export async function load({ fetch }) {
    const startTime = subDays(new Date(), 30).toISOString();
    const endTime = addDays(new Date(), 30).toISOString();

    const query = new URLSearchParams({ startTime, endTime });

    const response = await fetch(`/api/workflows.json?${query.toString()}`);

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    const body = await response.json();
    const workflows = body.workflows;

    return {
      props: {
        workflows,
      },
    };
  }
</script>

<script>
	export let workflows;
</script>

<h2>Workflows</h2>

{#await workflows}
  <p>Loading…</p>
{:then workflows}
  {#each workflows.executions as workflow}
    <p>{workflow.execution.workflowId}</p>
  {/each}
{:catch}
  <p>There was an error.</p>
{/await}

<slot />
