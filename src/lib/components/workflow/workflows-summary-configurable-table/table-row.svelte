<script lang="ts">
  import { getContext } from 'svelte';

  import Button from '$lib/holocene/button.svelte';
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    BATCH_OPERATION_CONTEXT,
    type BatchOperationContext,
  } from '$lib/pages/workflows-with-new-search.svelte';
  import { supportsBulkActions } from '$lib/stores/bulk-actions';
  import type { WorkflowExecution } from '$lib/types/workflows';

  export let workflow: WorkflowExecution | undefined = undefined;
  export let empty = false;
  export let viewChildren: (workflow: WorkflowExecution) => void;
  export let viewHistory: (workflowId: WorkflowExecution) => void;
  export let childActive = false;
  export let timelineActive = false;
  export let child = false;

  const { allSelected, selectedWorkflows } = getContext<BatchOperationContext>(
    BATCH_OPERATION_CONTEXT,
  );

  $: label = translate('workflows.select-workflow', {
    workflow: workflow?.id,
  });
</script>

<tr
  data-testid="workflows-summary-configurable-table-row"
  class:empty
  class:child
>
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
    <td
      class="cursor-point relative flex items-center justify-center gap-0.5 pt-2"
    >
      {#if !child}
        <Button
          size="xxs"
          variant={childActive ? 'primary' : 'ghost'}
          on:click={() => viewChildren(workflow)}
        >
          <Tooltip text="View Children" topLeft>
            <Icon name="relationship" class="scale-80" />
          </Tooltip>
        </Button>
      {/if}
      <Button
        size="xxs"
        variant={timelineActive ? 'primary' : 'ghost'}
        on:click={() => viewHistory(workflow)}
      >
        <Tooltip text="View Timeline" topLeft>
          <Icon name="timeline" class="scale-80" />
        </Tooltip>
      </Button>
    </td>
  {/if}
  <slot />
  <td />
</tr>

<style lang="postcss">
  .child {
    @apply bg-slate-50;
  }
</style>
