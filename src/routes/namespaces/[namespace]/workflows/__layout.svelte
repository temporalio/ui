<script context="module" lang="ts">
  import { namespace } from '$lib/stores/namespace';
</script>

<script lang="ts">
  import { isFullScreen } from '$lib/stores/full-screen';

  import WorkflowsSummaryTable from './_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from './_workflows-summary-row.svelte';
  import WorkflowFilters from './_workflow-filters.svelte';
  import { createWorkflowStore } from '$lib/stores/workflows';

  let store = createWorkflowStore($namespace);
  let workflows = store.filtered;

  let timeFormat = 'relative';

  let currentPage = 0;
  let executionsPerPage = 50;

  $: visibleWorkflows = $workflows.slice(
    currentPage,
    currentPage + executionsPerPage,
  );
</script>

<section class="flex items-start">
  {#if !$isFullScreen}
    <div class="w-full h-screen overflow-scroll">
      <header>
        <WorkflowFilters namespace={$namespace} {timeFormat} />
        <section class="bg-gray-100 p-4 flex gap-4">
          <p />
        </section>
      </header>
      <WorkflowsSummaryTable>
        <tbody slot="rows">
          {#each visibleWorkflows as workflow}
            <WorkflowsSummaryRow {workflow} {timeFormat} />
          {:else}
            <tr>
              <td
                colspan="5"
                class="m-auto p-12 text-center font-extralight text-2xl"
              >
                No Results
              </td>
            </tr>
          {/each}
        </tbody>
      </WorkflowsSummaryTable>
    </div>
  {/if}

  <slot />
</section>
