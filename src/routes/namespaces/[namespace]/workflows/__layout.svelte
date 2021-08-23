<script context="module" lang="ts">
  import type { LoadInput } from '@sveltejs/kit';
  import { WorkflowExecutionAPI } from '$lib/services/workflow-execution-service';
  import {
    toWorkflowExecutions,
    WorkflowExecution,
  } from '$lib/models/workflow-execution';

  export async function load({ fetch, page }: LoadInput) {
    const { namespace } = page.params;

    return await WorkflowExecutionAPI.getAll({ namespace }, fetch)
      .then(toWorkflowExecutions)
      .then((executions) => ({
        props: { executions },
      }));
  }
</script>

<script lang="ts">
  import { isFullScreen } from '$lib/stores/full-screen';

  import WorkflowsSummaryTable from './_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from './_workflows-summary-row.svelte';
  import WorkflowFilters from './_workflow-filters.svelte';
  import { unique } from '$lib/utilities/unique';

  export let executions: WorkflowExecution[];

  let status = null;
  let workflowType = null;
  let executionId = null;
  let runId = null;
  let relativeTime = true;

  let workflowTypes = executions
    .map((execution) => execution.name)
    .filter(unique);

  $: workflows = executions.filter((execution) => {
    // Right now, the type generated does not match the actual API response.
    // This is a temporary fix.
    const executionStatus = (execution.status as unknown) as WorkflowStatus;

    if (status && executionStatus !== status) return false;
    if (workflowType && execution.name !== workflowType) return false;
    if (executionId && !execution.id.startsWith(executionId)) return false;
    if (runId && !execution.runId.startsWith(runId)) return false;
    return true;
  });
</script>

<section class="flex items-start">
  {#if !$isFullScreen}
    <div class="w-full  h-screen overflow-scroll">
      <WorkflowFilters
        bind:status
        bind:workflowType
        bind:runId
        bind:executionId
        bind:relativeTime
        {workflowTypes}
      />
      <WorkflowsSummaryTable>
        <tbody slot="rows">
          {#each workflows as workflow}
            <WorkflowsSummaryRow {workflow} {relativeTime} />
          {:else}
            <tr>
              <td
                colspan="4"
                class="m-auto p-12 text-center font-extralight text-2xl"
                >No Results</td
              >
            </tr>
          {/each}
        </tbody>
      </WorkflowsSummaryTable>
    </div>
  {/if}

  <slot />
</section>
