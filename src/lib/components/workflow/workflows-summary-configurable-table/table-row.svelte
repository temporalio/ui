<script lang="ts">
  import { getContext } from 'svelte';

  import { page } from '$app/stores';

  import Button from '$lib/anthropocene/button.svelte';
  import IsTemporalServerVersionGuard from '$lib/components/is-temporal-server-version-guard.svelte';
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    BATCH_OPERATION_CONTEXT,
    type BatchOperationContext,
  } from '$lib/pages/workflows-with-new-search.svelte';
  import { supportsBulkActions } from '$lib/stores/bulk-actions';
  import { hideChildWorkflows } from '$lib/stores/filters';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { workflowCreateDisabled } from '$lib/utilities/workflow-create-disabled';

  import StartWorkflowButton from '../start-workflow-button.svelte';

  export let workflow: WorkflowExecution | undefined = undefined;
  export let empty = false;
  export let viewChildren: (workflow?: WorkflowExecution) => void = () => {};
  export let childCount: number | undefined = undefined;
  export let child = false;

  const { allSelected, selectedWorkflows } = getContext<BatchOperationContext>(
    BATCH_OPERATION_CONTEXT,
  );

  $: ({ namespace } = $page.params);

  $: label = translate('workflows.select-workflow', {
    workflow: workflow?.id,
  });

  $: childrenShown = childCount !== undefined;
</script>

<tr
  data-testid="workflows-summary-configurable-table-row"
  class:empty
  class:child
  class="dense"
>
  {#if !empty && $supportsBulkActions}
    <td class="relative">
      <Checkbox
        {label}
        labelHidden
        bind:group={$selectedWorkflows}
        value={workflow}
        disabled={$allSelected}
        aria-label={label}
      />
    </td>
    <td
      class="cursor-point relative flex items-center justify-center gap-0.5 py-0.5 {$hideChildWorkflows ||
      child
        ? 'w-auto'
        : 'w-6'}"
    >
      {#if !workflowCreateDisabled($page)}
        <StartWorkflowButton
          {namespace}
          workflowId={workflow.id}
          taskQueue={workflow.taskQueue}
          workflowType={workflow.name}
        />
      {/if}
      <IsTemporalServerVersionGuard minimumVersion="1.23.0">
        {#if $hideChildWorkflows && !child}
          <Button
            size="xs"
            variant={childrenShown ? 'primary' : 'ghost'}
            on:click={() => viewChildren(workflow)}
          >
            <Tooltip
              text={childrenShown
                ? translate('workflows.children', { count: childCount })
                : translate('workflows.show-children')}
              topLeft
            >
              <Icon name="relationship" class="scale-80" />
            </Tooltip>
          </Button>
        {/if}
      </IsTemporalServerVersionGuard>
    </td>
  {:else}
    <td></td>
  {/if}
  <slot />
</tr>

<style lang="postcss">
  .child {
    @apply bg-slate-100/50 dark:bg-slate-100/5;
  }
</style>
