<script lang="ts">
  import { page } from '$app/state';

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
  import { getBuildIdFromVersion } from '$lib/utilities/get-deployment-build-id';
  import {
    routeForEventHistory,
    routeForWorkerDeployment,
  } from '$lib/utilities/route-for';

  import FilterableTableCell from './filterable-table-cell.svelte';

  type Props = {
    column: ConfigurableTableHeader;
    workflow: WorkflowExecution;
  };
  let { column, workflow }: Props = $props();

  const { label } = $derived(column);
  const namespace = $derived(page.params.namespace);

  let filterOrCopyButtonsVisible = $state(false);
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

  const filterableLabels = [
    'Type',
    'Workflow ID',
    'Run ID',
    'Deployment',
    'Versioning Behavior',
    'Deployment Version',
    'Build ID',
  ];
</script>

{#if filterableLabels.includes(label)}
  <td
    class="workflows-summary-table-body-cell filterable"
    data-testid="workflows-summary-table-body-cell"
    onmouseover={showFilterOrCopy}
    onfocus={showFilterOrCopy}
    onfocusin={showFilterOrCopy}
    onfocusout={handleFocusOut}
    onmouseleave={hideFilterOrCopy}
    onblur={hideFilterOrCopy}
  >
    {#if label === 'Type'}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute="WorkflowType"
        value={workflow.name}
        href={routeForEventHistory({
          namespace,
          workflow: workflow.id,
          run: workflow.runId,
        })}
      />
    {:else if label === 'Workflow ID'}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute="WorkflowId"
        value={workflow.id}
        href={routeForEventHistory({
          namespace,
          workflow: workflow.id,
          run: workflow.runId,
        })}
      />
    {:else if label === 'Run ID'}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute="RunId"
        value={workflow.runId}
        href={routeForEventHistory({
          namespace,
          workflow: workflow.id,
          run: workflow.runId,
        })}
      />
    {:else if label === 'Deployment'}
      {@const deployment =
        workflow.searchAttributes?.indexedFields?.TemporalWorkerDeployment}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute="TemporalWorkerDeployment"
        value={deployment && typeof deployment === 'string' ? deployment : ''}
        href={routeForWorkerDeployment({
          namespace,
          deployment,
        })}
      />
    {:else if label === 'Deployment Version'}
      {@const version =
        workflow.searchAttributes?.indexedFields
          ?.TemporalWorkerDeploymentVersion}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute="TemporalWorkerDeploymentVersion"
        value={version && typeof version === 'string' ? version : ''}
      />
    {:else if label === 'Build ID'}
      {@const buildId =
        workflow?.searchAttributes?.indexedFields?.['TemporalWorkerBuildId'] ||
        getBuildIdFromVersion(
          workflow.searchAttributes?.indexedFields
            ?.TemporalWorkerDeploymentVersion,
        )}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute="TemporalWorkerBuildId"
        value={buildId && typeof buildId === 'string' ? buildId : ''}
      />
    {:else if label === 'Versioning Behavior'}
      {@const behavior =
        workflow.searchAttributes?.indexedFields
          ?.TemporalWorkflowVersioningBehavior}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute="TemporalWorkflowVersioningBehavior"
        value={behavior && typeof behavior === 'string' ? behavior : ''}
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
    {:else if label === 'Change Version'}
      {workflow.searchAttributes?.indexedFields?.TemporalChangeVersion}
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
    @apply h-8 whitespace-nowrap;

    &.filterable {
      @apply relative pr-24;
    }
  }
</style>
