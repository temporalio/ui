<script lang="ts">
  import { page } from '$app/state';

  import Timestamp from '$lib/components/timestamp.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import {
    customSearchAttributes,
    isCustomSearchAttribute,
    workflowIncludesSearchAttribute,
  } from '$lib/stores/search-attributes';
  import {
    SEARCH_ATTRIBUTE_TYPE,
    type WorkflowExecution,
  } from '$lib/types/workflows';
  import { isWorkflowDelayed } from '$lib/utilities/delayed-workflows';
  import { formatBytes } from '$lib/utilities/format-bytes';
  import { formatDistance } from '$lib/utilities/format-time';
  import { getBuildIdFromVersion } from '$lib/utilities/get-deployment-build-id';
  import {
    routeForTimeline,
    routeForWorkerDeployment,
  } from '$lib/utilities/route-for';
  import { isWorkflowTaskFailure } from '$lib/utilities/workflow-task-failures';

  import FilterableTableCell from './filterable-table-cell.svelte';

  type Props = {
    column: ConfigurableTableHeader;
    workflow: WorkflowExecution;
    archival?: boolean;
  };
  let { column, workflow, archival = false }: Props = $props();

  const { label } = $derived(column);
  const namespace = $derived(page.params.namespace);
  const isCustomKeywordOrTextAttribute = $derived(
    isCustomSearchAttribute(label) &&
      ($customSearchAttributes[label] === SEARCH_ATTRIBUTE_TYPE.KEYWORD ||
        $customSearchAttributes[label] === SEARCH_ATTRIBUTE_TYPE.TEXT) &&
      typeof workflow.searchAttributes?.indexedFields?.[label] === 'string',
  );

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
    'Scheduled By ID',
  ];
</script>

{#if filterableLabels.includes(label) || isCustomKeywordOrTextAttribute}
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
        href={routeForTimeline({
          namespace,
          workflow: workflow.id,
          run: workflow.runId,
          archival,
        })}
      />
    {:else if label === 'Workflow ID'}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute="WorkflowId"
        value={workflow.id}
        href={routeForTimeline({
          namespace,
          workflow: workflow.id,
          run: workflow.runId,
          archival,
        })}
      />
    {:else if label === 'Run ID'}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute="RunId"
        value={workflow.runId}
        href={routeForTimeline({
          namespace,
          workflow: workflow.id,
          run: workflow.runId,
          archival,
        })}
      />
    {:else if label === 'Deployment'}
      {@const deployment =
        workflow.searchAttributes?.indexedFields?.TemporalWorkerDeployment}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute="TemporalWorkerDeployment"
        value={deployment && typeof deployment === 'string' ? deployment : ''}
        href={deployment
          ? routeForWorkerDeployment({
              namespace,
              deployment,
            })
          : undefined}
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
    {:else if isCustomKeywordOrTextAttribute}
      {@const content = workflow.searchAttributes?.indexedFields?.[label]}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute={label}
        value={content}
        type={$customSearchAttributes[label]}
      />
    {:else if label === 'Scheduled By ID'}
      {@const scheduleId =
        workflow.searchAttributes?.indexedFields?.TemporalScheduledById}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute="TemporalScheduledById"
        value={scheduleId && typeof scheduleId === 'string' ? scheduleId : ''}
      />
    {/if}
  </td>
{:else}
  <td
    class="workflows-summary-table-body-cell"
    data-testid="workflows-summary-table-body-cell"
  >
    {#if label === 'Status'}
      <WorkflowStatus
        status={workflow.status}
        delayed={isWorkflowDelayed(workflow)}
        taskFailure={isWorkflowTaskFailure(workflow)}
      />
    {:else if label === 'End'}
      <Timestamp dateTime={workflow.endTime} />
    {:else if label === 'Start'}
      <Timestamp dateTime={workflow.startTime} />
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
      <Timestamp dateTime={workflow.executionTime} />
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
      {#if content && typeof content === 'string'}
        <Timestamp dateTime={content} />
      {/if}
    {:else if label === 'Change Version'}
      {workflow.searchAttributes?.indexedFields?.TemporalChangeVersion}
    {:else if isCustomSearchAttribute(label) && workflowIncludesSearchAttribute(workflow, label)}
      {@const content = workflow.searchAttributes?.indexedFields?.[label]}
      {#if $customSearchAttributes[label] === SEARCH_ATTRIBUTE_TYPE.DATETIME && typeof content === 'string'}
        <Timestamp dateTime={content} />
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
