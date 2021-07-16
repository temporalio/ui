<script context="module">
  import { subDays, addDays } from 'date-fns';

  export async function load({ fetch }) {
    const startTime = subDays(new Date(), 30).toISOString();
    const endTime = addDays(new Date(), 30).toISOString();

    const query = new URLSearchParams({ startTime, endTime });
    const response = await fetch(`/api/workflows?${query}`);

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

<script lang="ts">
  import WorkflowSummaryRow from './_workflow-summary-row.svelte';

  export let workflows;
</script>

<section id="workflows">
  <table>
    <thead>
      <tr>
        <th>Workflow/Run ID</th>
        <th>Status</th>
        <th>Started</th>
        <th>Ended</th>
      </tr>
    </thead>
    <tbody>
      {#await workflows}
        <p>Loading…</p>
      {:then workflows}
        {#each workflows.executions as workflow}
          <WorkflowSummaryRow {workflow} />
        {/each}
      {:catch}
        <p>There was an error.</p>
      {/await}
    </tbody>
  </table>
  <slot />
</section>

<style>
  #workflows {
    display: flex;
    align-items: flex-start;
  }

  table {
    border-collapse: collapse;
    width: 100%;
  }

  thead tr {
    background: #f9fafb;
  }

  th {
    background: #f9fafb;
    color: #6b7280;
    font-size: 12px;
    height: 40px;
    letter-spacing: 0.05em;
    line-height: 16px;
    margin: 0;
    padding: 12px 24px;
    text-align: left;
    text-transform: uppercase;
  }

  tbody {
    background: #f3f4f6;
  }
</style>
