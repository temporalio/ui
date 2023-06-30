<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import {
    selectedWorkflows,
    allSelected,
  } from '$lib/pages/workflows-with-new-search.svelte';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { routeForEventHistory } from '$lib/utilities/route-for';
  import { supportsBulkActions } from '$lib/stores/bulk-actions';

  export let workflow: WorkflowExecution | undefined = undefined;
  export let empty: boolean = false;
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
</script>

<tr
  data-testid="workflows-summary-configurable-table-row"
  on:click={goToEventHistory}
  class:empty
>
  {#if !empty && $supportsBulkActions}
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
  <td />
</tr>
