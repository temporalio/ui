<script context="module" lang="ts">
  import { WorkflowExecutionInfo } from '$types/temporal/api/workflow/v1/message.ts';
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ fetch }: LoadInput) {
    const { executions }: ListOpenWorkflowExecutionsResponse = await fetch(
      `http://localhost:8080/api/v1/namespaces/default/workflows/open`,
    ).then((response) => response.json());

    return {
      props: {
        executions,
      },
    };
  }
</script>

<script lang="ts">
  import WorkflowsSummaryTable from './_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from './_workflows-summary-row.svelte';

  export let executions;
</script>

<section class="flex items-start">
  <WorkflowsSummaryTable>
    <tbody slot="rows">
      {#await executions}
        <p>Loading…</p>
      {:then executions}
        {#each executions as workflow}
          <WorkflowsSummaryRow {workflow} />
        {/each}
      {:catch}
        <p>There was an error.</p>
      {/await}
    </tbody>
  </WorkflowsSummaryTable>
  <slot />
</section>
