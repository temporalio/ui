<script lang="ts">
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import ProgressBar from '$lib/holocene/progress-bar.svelte';
  import type { WorkflowHeader } from '$lib/stores/workflow-table-columns';
  import { updating, loading, workflowError } from '$lib/stores/workflows';

  export let pinned = false;
  export let columns: WorkflowHeader[];
  export let totalColumnCount: number;
  export let empty: boolean;
</script>

<table class="workflows-summary-table" class:pinned>
  <thead>
    <slot name="headers" />
    {#if $updating}
      <ProgressBar />
    {/if}
  </thead>
  <tbody>
    {#if !pinned && $loading}
      <tr>
        <td colspan={columns.length + 1}>
          <Loading />
        </td>
      </tr>
    {:else if !pinned && empty}
      <tr>
        <td colspan={columns.length + 1}>
          <EmptyState
            title="No Workflows Found"
            content="If you have filters applied, try adjusting them. Otherwise please check your syntax and try again."
            error={$workflowError}
          />
        </td>
      </tr>
    {:else if !pinned && totalColumnCount === 0}
      <tr>
        <td colspan={columns.length + 1}>
          <EmptyState title="No column headers are in view">
            <p class="text-center">
              At least one column heading is required to display workflows.
              Click the <span class="whitespace-nowrap"
                >(<Icon class="inline" name="vertical-ellipsis" />)</span
              >
              in the top right corner of the Workflow List to reveal the Configure
              Workflow List panel. Click the
              <span class="whitespace-nowrap"
                >(<Icon class="inline" name="add" />)</span
              > to add column headings.
            </p>
          </EmptyState>
        </td>
      </tr>
    {:else}
      <slot />
    {/if}
  </tbody>
</table>

<style lang="postcss">
  .workflows-summary-table {
    @apply table-fixed w-auto;

    &:not(.pinned) {
      @apply table-auto w-full;
    }
  }
</style>
