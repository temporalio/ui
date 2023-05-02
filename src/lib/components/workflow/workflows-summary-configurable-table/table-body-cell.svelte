<script lang="ts">
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import {
    customSearchAttributes,
    isCustomSearchAttribute,
    workflowIncludesSearchAttribute,
  } from '$lib/stores/search-attributes';
  import { timeFormat } from '$lib/stores/time-format';
  import type { WorkflowHeader } from '$lib/stores/workflow-table-columns';
  import { formatDate } from '$lib/utilities/format-date';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import FilterableTableCell from './filterable-table-cell.svelte';
  import { formatBytes } from '$lib/utilities/format-bytes';
  import { formatDistance } from '$lib/utilities/format-time';

  export let column: WorkflowHeader;
  export let workflow: WorkflowExecution;

  $: ({ label } = column);

  let filterOrCopyButtonsVisible = false;
  const showFilterOrCopy = () => (filterOrCopyButtonsVisible = true);
  const hideFilterOrCopy = () => (filterOrCopyButtonsVisible = false);
</script>

{#if label === 'Run ID' || label === 'Workflow ID' || label === 'Type'}
  <td
    class="workflows-summary-table-body-cell filterable"
    data-testid="workflows-summary-table-body-cell"
    on:mouseover={showFilterOrCopy}
    on:focus={showFilterOrCopy}
    on:mouseleave={hideFilterOrCopy}
    on:blur={hideFilterOrCopy}
  >
    {#if label === 'Type'}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute="WorkflowType"
        {workflow}
      />
    {:else if label === 'Workflow ID'}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute="WorkflowId"
        {workflow}
      />
    {:else if label === 'Run ID'}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute="RunId"
        {workflow}
      />
    {/if}
  </td>
{:else}
  <td
    class="workflows-summary-table-body-cell"
    data-testid="workflows-summary-table-body-cell"
  >
    {#if label === 'Status'}
      <WorkflowStatus status={workflow.status} />
    {:else if label === 'End'}
      {formatDate(workflow.endTime, $timeFormat)}
    {:else if label === 'Start'}
      {formatDate(workflow.startTime, $timeFormat)}
    {:else if label === 'Task Queue'}
      {workflow.taskQueue}
    {:else if label === 'Parent Namespace'}
      {workflow.parentNamespaceId}
    {:else if label === 'Parent Workflow ID'}
      {workflow.parent ? workflow.parent.workflowId : ''}
    {:else if label === 'History Size'}
      {formatBytes(parseInt(workflow.historySizeBytes, 10))}
    {:else if label === 'State Transitions'}
      {parseInt(workflow.stateTransitionCount, 10) > 0
        ? workflow.stateTransitionCount
        : ''}
    {:else if label === 'Execution Time'}
      {formatDate(workflow.executionTime, $timeFormat)}
    {:else if label === 'Execution Duration'}
      {formatDistance({ start: workflow.startTime, end: workflow.endTime })}
    {:else if label === 'History Length'}
      {parseInt(workflow.historyEvents, 10) > 0 ? workflow.historyEvents : ''}
    {:else if isCustomSearchAttribute(label) && workflowIncludesSearchAttribute(workflow, label)}
      {@const content = workflow.searchAttributes.indexedFields[label]}
      {#if $customSearchAttributes[label] === 'Datetime' && typeof content === 'string'}
        {formatDate(content, $timeFormat)}
      {:else if $customSearchAttributes[label] === 'Bool'}
        <Badge>{content}</Badge>
      {:else}
        {content}
      {/if}
    {/if}
  </td>
{/if}

<style lang="postcss">
  .workflows-summary-table-body-cell {
    @apply whitespace-nowrap px-2 h-10 text-sm;

    &.filterable {
      @apply relative pr-24;
    }
  }
</style>
