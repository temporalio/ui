<script lang="ts">
  import { page } from '$app/stores';

  import WorkflowsSummaryRowWithFilters from './workflows-summary-row-with-filters.svelte';
  import WorkflowsSummaryTableWithFilters from './workflows-summary-table-with-filters.svelte';
  import { bulkActionsEnabled as workflowBulkActionsEnabled } from '$lib/utilities/bulk-actions-enabled';
  import { supportsAdvancedVisibility } from '$lib/stores/bulk-actions';
  import { updating, loading, workflowError } from '$lib/stores/workflows';
  import { timeFormat } from '$lib/stores/time-format';
  import Loading from '$lib/holocene/loading.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';

  export let workflows: WorkflowExecution[];
  export let selectedWorkflows: WorkflowExecution[];
  export let filteredWorkflowCount: string;
  export let allSelected: boolean;
  export let pageSelected: boolean;

  $: bulkActionsEnabled = workflowBulkActionsEnabled(
    $page.data.settings,
    $supportsAdvancedVisibility,
  );

  $: selectedWorkflowsCount = selectedWorkflows.length;
</script>

<WorkflowsSummaryTableWithFilters
  updating={$updating}
  {bulkActionsEnabled}
  {workflows}
  {selectedWorkflowsCount}
  {filteredWorkflowCount}
  {allSelected}
  {pageSelected}
  on:terminateWorkflows
  on:cancelWorkflows
  on:selectAll
  on:togglePage
>
  {#each workflows as event}
    <WorkflowsSummaryRowWithFilters
      {bulkActionsEnabled}
      workflow={event}
      namespace={$page.params.namespace}
      timeFormat={$timeFormat}
      checkboxDisabled={allSelected}
      bind:selectedWorkflows
    />
  {:else}
    <tr>
      <td colspan={bulkActionsEnabled ? 6 : 5} class="xl:hidden">
        {#if $loading}
          <Loading />
        {:else}
          <EmptyState
            title="No Workflows Found"
            content="If you have filters applied, try adjusting them. Otherwise please check your syntax and try again."
            error={$workflowError}
          />
        {/if}
      </td>
      <td colspan={bulkActionsEnabled ? 8 : 7} class="max-xl:hidden">
        {#if $loading}
          <Loading />
        {:else}
          <EmptyState
            title="No Workflows Found"
            content="If you have filters applied, try adjusting them. Otherwise please check your syntax and try again."
            error={$workflowError}
          />
        {/if}
      </td>
    </tr>
  {/each}
</WorkflowsSummaryTableWithFilters>
