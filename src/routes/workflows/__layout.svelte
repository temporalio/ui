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
  import { formatDate } from '$lib/utilities/format-date';

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
          <tr>
            <td>
              <a
                href="/workflows/{workflow.execution.workflowId}/{workflow
                  .execution.runId}"
              >
                <h3>
                  {workflow.type.name}
                </h3>
                <p>
                  {workflow.execution.runId}
                </p>
              </a>
            </td>
            <td>
              <a
                href="/workflows/{workflow.execution.workflowId}/{workflow
                  .execution.runId}"
              >
                <p class="workflow-status">{workflow.status}</p>
              </a>
            </td>
            <td>
              <a
                href="/workflows/{workflow.execution.workflowId}/{workflow
                  .execution.runId}"
              >
                <p>{formatDate(workflow.startTime)}</p>
              </a>
            </td>
            <td>
              <a
                href="/workflows/{workflow.execution.workflowId}/{workflow
                  .execution.runId}"
              >
                <p>{formatDate(workflow.closeTime)}</p>
              </a>
            </td>
          </tr>
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

  a {
    text-decoration: none;
    display: block;
    padding: 16px 24px;
    height: 100%;
    width: 100%;
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

  tbody tr {
    background: #f3f4f6;
  }

  tbody tr:hover {
    background: #eeeff1;
  }

  tbody td {
    padding: 0;
  }

  tbody h3 {
    color: #111827;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 20px;
    margin: 0;
  }

  tbody p {
    color: #6b7280;
    font-size: 14px;
    margin: 0;
  }

  tbody p.workflow-status {
    font-family: Inter;
    font-style: normal;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    text-align: center;
    color: #065f46;
    padding: 2px 10px;
    background: #d1fae5;
    border-radius: 10px;
  }
</style>
