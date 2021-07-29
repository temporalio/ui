<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import { subDays, addDays } from 'date-fns';

  export async function load({ fetch }: LoadInput) {
    const startTime = subDays(new Date(), 30).toISOString();
    const endTime = addDays(new Date(), 30).toISOString();

    const query = new URLSearchParams({
      'start_time_filter.earliest_time': startTime, // TODO field names should come from ListWorkflowExecutionsRequest
      'start_time_filter.latest_time': endTime,
    });
    const response = await fetch(`/api/workflows?${query}`);

    if (!response.ok) {
      const message = `An error has occurred: ${response.status}`;
      throw new Error(message);
    }

    const { workflows }: { WorkflowsAPIResponse } = await response.json();

    return {
      props: {
        workflows,
      },
    };
  }
</script>

<script lang="ts">
  import WorkflowsSummaryTable from './_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from './_workflows-summary-row.svelte';

  export let workflows: WorkflowsAPIResponse;
</script>

<section class="flex items-start">
  <WorkflowsSummaryTable>
    <tbody slot="rows">
      {#await workflows}
        <p>Loading…</p>
      {:then workflows}
        {#each workflows.executions as workflow}
          <WorkflowsSummaryRow {workflow} />
        {/each}
      {:catch}
        <p>There was an error.</p>
      {/await}
    </tbody>
  </WorkflowsSummaryTable>
  <slot />
</section>
