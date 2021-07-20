<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import { subDays, addDays } from 'date-fns';

  export async function load({ fetch }: LoadInput) {
    const startTime = subDays(new Date(), 30).toISOString();
    const endTime = addDays(new Date(), 30).toISOString();

    const query = new URLSearchParams({ startTime, endTime });
    const response = await fetch(`/api/workflows?${query}`);

    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }

    const { workflows } = await response.json();

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

<section id="workflows">
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

<style>
  #workflows {
    display: flex;
    align-items: flex-start;
  }
</style>
