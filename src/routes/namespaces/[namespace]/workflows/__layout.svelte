<script context="module" lang="ts">
  export async function load({ page }) {
    const namespace = page.params.namespace;
    return { props: { namespace: namespace } };
  }
</script>

<script lang="ts">
  import { isFullScreen } from '$lib/stores/full-screen';

  import WorkflowsSummaryTable from './_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from './_workflows-summary-row.svelte';
  import WorkflowFilters from './_workflow-filters.svelte';
  import { unique } from '$lib/utilities/unique';
  import { createWorkflowStore } from '$lib/stores/workflows';

  export let namespace: string;
  let store = createWorkflowStore(namespace);
  let executions = store.all();

  let status = null;
  let workflowType = null;
  let executionId = null;
  let runId = null;
  let timeFormat = 'relative';

  $: workflowTypes = $executions
    .map((execution) => execution.name)
    .filter(unique);

  $: workflows = $executions.filter((execution) => {
    // Right now, the type generated does not match the actual API response.
    // This is a temporary fix.
    const executionStatus = execution.status as unknown as WorkflowStatus;

    if (status && executionStatus !== status) return false;
    if (workflowType && execution.name !== workflowType) return false;
    if (executionId && !execution.id.startsWith(executionId)) return false;
    if (runId && !execution.runId.startsWith(runId)) return false;
    return true;
  });

  let currentPage = 0;
  let executionsPerPage = 50;

  $: matchingWorkflows = workflows.length;
  $: totalExecutions = $executions.length;

  $: visibleWorkflows = workflows.slice(
    currentPage,
    currentPage + executionsPerPage,
  );
</script>

<section class="flex items-start">
  {#if !$isFullScreen}
    <div class="w-full h-screen overflow-scroll">
      <p>{workflows.length}</p>
      <WorkflowFilters
        bind:status
        bind:workflowType
        bind:runId
        bind:executionId
        bind:timeFormat
        {workflowTypes}
      />
      <WorkflowsSummaryTable>
        <tbody slot="rows">
          {#each workflows as workflow}
            <WorkflowsSummaryRow {workflow} {timeFormat} />
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
