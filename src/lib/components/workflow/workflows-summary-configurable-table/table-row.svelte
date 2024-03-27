<script lang="ts">
  import { getContext } from 'svelte';

  import Checkbox from '$lib/holocene/checkbox.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    BATCH_OPERATION_CONTEXT,
    type BatchOperationContext,
  } from '$lib/pages/workflows-with-new-search.svelte';
  import { supportsBulkActions } from '$lib/stores/bulk-actions';
  import type { WorkflowExecution } from '$lib/types/workflows';

  export let workflow: WorkflowExecution | undefined = undefined;
  export let empty = false;

  const { allSelected, selectedWorkflows } = getContext<BatchOperationContext>(
    BATCH_OPERATION_CONTEXT,
  );

  $: label = translate('workflows.select-workflow', {
    workflow: workflow?.id,
  });
</script>

<tr data-testid="workflows-summary-configurable-table-row" class:empty>
  {#if !empty && $supportsBulkActions}
    <td class="relative px-2">
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
