<script lang="ts">
  import { isFullScreen } from '$lib/stores/full-screen';
  import { namespace } from '$lib/stores/namespace';
  import { createWorkflowStore } from '$lib/stores/workflows';

  import WorkflowsSummaryTable from './_workflows-summary-table.svelte';
  import WorkflowsSummaryRow from './_workflows-summary-row.svelte';
  import WorkflowFilters from './_workflow-filters.svelte';

  $: store = createWorkflowStore($namespace);
  $: workflows = store.filtered;

  let timeFormat = 'relative';
  let currentPage = 0;
  let executionsPerPage = 50;

  $: maximumPage = Math.ceil($workflows.length / executionsPerPage);

  $: visibleWorkflows = $workflows.slice(
    currentPage * executionsPerPage,
    currentPage * executionsPerPage + executionsPerPage,
  );

  $: {
    if (currentPage > maximumPage) currentPage = maximumPage - 1;
  }
</script>

<section class="flex items-start">
  {#if !$isFullScreen}
    <div class="w-full h-screen overflow-scroll">
      <header>
        <WorkflowFilters {timeFormat} />
        <section class="bg-gray-100 p-4 flex gap-4">
          <button on:click={() => currentPage--} disabled={currentPage <= 0}>
            Previous
          </button>
          <p>
            Page {currentPage + 1} of {maximumPage}
          </p>
          <button
            on:click={() => currentPage++}
            disabled={currentPage >= maximumPage - 1}
          >
            Next
          </button>
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

<style lang="postcss">
  button {
    @apply rounded-lg border-purple-600 border-2 bg-white text-purple-600 px-2 text-sm;
  }

  button:disabled {
    @apply text-purple-400 border-purple-400;
  }
</style>
