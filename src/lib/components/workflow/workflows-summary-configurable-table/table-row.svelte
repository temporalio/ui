<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    allSelected,
    selectedWorkflows,
  } from '$lib/pages/workflows-with-new-search.svelte';
  import { supportsBulkActions } from '$lib/stores/bulk-actions';
  import type { WorkflowExecution } from '$lib/types/workflows';

  export let workflow: WorkflowExecution | undefined = undefined;
  export let empty = false;

  $: label = translate('workflows.select-workflow', {
    workflow: workflow?.id,
  });
</script>

<tr data-testid="workflows-summary-configurable-table-row" class:empty>
  {#if !empty && $supportsBulkActions}
    <td>
      <Checkbox
        {label}
        labelHidden
        hoverable
        bind:group={$selectedWorkflows}
        value={workflow}
        disabled={$allSelected}
        aria-label={label}
      />
    </td>
  {/if}
  <slot />
  <td />
</tr>
