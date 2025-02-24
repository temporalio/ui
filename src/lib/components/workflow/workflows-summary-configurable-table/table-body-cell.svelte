<script lang="ts">
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import {
    customSearchAttributes,
    isCustomSearchAttribute,
    workflowIncludesSearchAttribute,
  } from '$lib/stores/search-attributes';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import {
    SEARCH_ATTRIBUTE_TYPE,
    type WorkflowExecution,
  } from '$lib/types/workflows';
  import { formatBytes } from '$lib/utilities/format-bytes';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatDistance } from '$lib/utilities/format-time';

  import FilterableTableCell from './filterable-table-cell.svelte';

  export let column: ConfigurableTableHeader;
  export let workflow: WorkflowExecution;

  $: ({ label } = column);

  let filterOrCopyButtonsVisible = false;
  const showFilterOrCopy = () => (filterOrCopyButtonsVisible = true);
  const hideFilterOrCopy = () => (filterOrCopyButtonsVisible = false);
  const handleFocusOut = (e: FocusEvent) => {
    const nextTarget = e.relatedTarget as HTMLElement;
    if (
      nextTarget &&
      !['filter-button', 'copy-button'].includes(nextTarget.id)
    ) {
      hideFilterOrCopy();
    }
  };
</script>

{#if label === 'Run ID' || label === 'Workflow ID' || label === 'Type'}
  <td
    class="workflows-summary-table-body-cell filterable"
    data-testid="workflows-summary-table-body-cell"
    on:mouseover={showFilterOrCopy}
    on:focus={showFilterOrCopy}
    on:focusin={showFilterOrCopy}
    on:focusout={handleFocusOut}
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
      {formatDate(workflow.endTime, $timeFormat, {
        relative: $relativeTime,
      })}
    {:else if label === 'Start'}
      {formatDate(workflow.startTime, $timeFormat, {
        relative: $relativeTime,
      })}
    {:else if label === 'Task Queue'}
      {workflow.taskQueue}
    {:else if label === 'Parent Namespace'}
      {workflow?.parentNamespaceId ?? ''}
    {:else if label === 'History Size'}
      {formatBytes(parseInt(workflow.historySizeBytes, 10))}
    {:else if label === 'State Transitions'}
      {parseInt(workflow.stateTransitionCount, 10) > 0
        ? workflow.stateTransitionCount
        : ''}
    {:else if label === 'Execution Time'}
      {formatDate(workflow.executionTime, $timeFormat, {
        relative: $relativeTime,
      })}
    {:else if label === 'Execution Duration'}
      {formatDistance({
        start: workflow.startTime,
        end: workflow.endTime,
        includeMillisecondsForUnderSecond: true,
      })}
    {:else if label === 'History Length'}
      {parseInt(workflow.historyEvents, 10) > 0 ? workflow.historyEvents : ''}
    {:else if label === 'Scheduled By ID'}
      {workflow.searchAttributes?.indexedFields?.TemporalScheduledById ?? ''}
    {:else if label === 'Scheduled Start Time'}
      {@const content =
        workflow.searchAttributes?.indexedFields?.TemporalScheduledStartTime}
      {content && typeof content === 'string'
        ? formatDate(content, $timeFormat, { relative: $relativeTime })
        : ''}
    {:else if label === 'Deployment'}
      {@const content =
        workflow.searchAttributes?.indexedFields?.TemporalWorkerDeployment}
      {content && typeof content === 'string' ? content : ''}
    {:else if label === 'Deployment Version'}
      {@const content =
        workflow.searchAttributes?.indexedFields
          ?.TemporalWorkerDeploymentVersion}
      {content && typeof content === 'string' ? content : ''}
    {:else if label === 'Versioning Behavior'}
      {@const content =
        workflow.searchAttributes?.indexedFields
          ?.TemporalWorkflowVersioningBehavior}
      {content && typeof content === 'string' ? content : ''}
    {:else if isCustomSearchAttribute(label) && workflowIncludesSearchAttribute(workflow, label)}
      {@const content = workflow.searchAttributes.indexedFields[label]}
      {#if $customSearchAttributes[label] === SEARCH_ATTRIBUTE_TYPE.DATETIME && typeof content === 'string'}
        {formatDate(content, $timeFormat, {
          relative: $relativeTime,
        })}
      {:else if $customSearchAttributes[label] === SEARCH_ATTRIBUTE_TYPE.BOOL}
        <Badge>{content}</Badge>
      {:else}
        {content}
      {/if}
    {/if}
  </td>
{/if}

<style lang="postcss">
  .workflows-summary-table-body-cell {
    @apply h-10 whitespace-nowrap;

    &.filterable {
      @apply relative pr-24;
    }
  }
</style>
