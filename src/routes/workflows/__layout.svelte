<script context="module" lang="ts">
  import type { WorkflowExecutionInfo } from '$types/temporal/api/workflow/v1/message';
  import type { ListWorkflowExecutionsResponse } from '$types/temporal/api/workflowservice/v1/request_response';
  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ fetch }: LoadInput) {
    const { executions }: ListWorkflowExecutionsResponse = await fetch(
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
  import { isFullScreen } from '$lib/stores/full-screen';

  import WorkflowsSummaryTable from './_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from './_workflows-summary-row.svelte';

  export let executions: WorkflowExecutionInfo[];
</script>

<section class="flex items-start">
  {#if !$isFullScreen}
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
  {/if}
  <slot />
</section>
