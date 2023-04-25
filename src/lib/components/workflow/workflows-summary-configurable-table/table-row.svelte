<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { getContext } from 'svelte';
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import {
    BATCH_ACTION_CONTEXT,
    type BatchActionContext,
  } from '$lib/pages/workflows-with-new-search.svelte';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { routeForEventHistory } from '$lib/utilities/route-for';

  export let workflow: WorkflowExecution;
  export let pinned = false;
  $: namespace = $page.params.namespace;

  const goToEventHistory = (event: MouseEvent) => {
    if (event.target instanceof HTMLAnchorElement) return;
    goto(
      routeForEventHistory({
        namespace,
        workflow: workflow.id,
        run: workflow.runId,
      }),
    );
  };

  let { selectedWorkflows } =
    getContext<BatchActionContext>(BATCH_ACTION_CONTEXT);

  const { allSelected, batchActionsEnabled } =
    getContext<BatchActionContext>(BATCH_ACTION_CONTEXT);
</script>

<tr
  class="workflows-summary-configurable-table-row"
  on:click={goToEventHistory}
>
  {#if pinned && batchActionsEnabled}
    <td>
      <Checkbox
        hoverable
        bind:group={$selectedWorkflows}
        value={workflow}
        disabled={$allSelected}
        aria-label="select workflow"
      />
    </td>
  {/if}
  <slot />
  {#if !pinned}
    <td />
  {/if}
</tr>

<style lang="postcss">
  .workflows-summary-configurable-table-row {
    @apply border-b border-primary cursor-pointer h-11 last-of-type:border-b-0;
  }

  .workflows-summary-configurable-table-row:hover {
    /* bg-fixed solves an issue with safari applying the gradient on each td instead of across the entire row */
    @apply bg-gradient-to-br from-blue-100 to-purple-100 bg-fixed;

    :global(.table-link) {
      @apply text-blue-700 underline decoration-blue-700;
    }
  }
</style>
