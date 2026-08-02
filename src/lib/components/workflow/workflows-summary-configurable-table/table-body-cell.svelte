<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { twMerge } from 'tailwind-merge';

  import { page } from '$app/state';

  import WorkflowStatus from '$lib/components/execution-status.svelte';
  import Timestamp from '$lib/components/timestamp.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
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
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { getBuildIdFromVersion } from '$lib/utilities/get-deployment-build-id';
  import {
    routeForWorkerDeployment,
    routeForWorkflow,
  } from '$lib/utilities/route-for';
  import {
    TRUNCATE_LENGTH,
    truncateValue,
  } from '$lib/utilities/truncate-value';
  import { isWorkflowTaskFailure } from '$lib/utilities/workflow-task-failures';

  import FilterableTableCell from './filterable-table-cell.svelte';

  type Props = {
    column: ConfigurableTableHeader;
    workflow: WorkflowExecution;
    truncate?: boolean;
    archival?: boolean;
  };
  let {
    column,
    workflow,
    truncate = false,
    archival = false,
  }: Props = $props();

  const { label, width } = $derived(column);
  const namespace = $derived(page.params.namespace);
  const isCustomKeywordOrTextAttribute = $derived(
    isCustomSearchAttribute(label) &&
      ($customSearchAttributes[label] === SEARCH_ATTRIBUTE_TYPE.KEYWORD ||
        $customSearchAttributes[label] === SEARCH_ATTRIBUTE_TYPE.TEXT) &&
      typeof workflow.searchAttributes?.indexedFields?.[label] === 'string',
  );

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

  // a pinned width only holds in the table's auto layout if the cell clamps its own content, so the cell and its link/tooltip child have to ellipsize
  const truncateToWidth =
    'overflow-hidden text-ellipsis [&_.wrapper]:block [&_.wrapper]:max-w-full [&_.wrapper]:overflow-hidden [&_.wrapper]:text-ellipsis [&_a]:block [&_a]:overflow-hidden [&_a]:text-ellipsis';

  const className = $derived(
    twMerge(
      'relative h-8 whitespace-nowrap',
      width !== undefined && truncateToWidth,
    ),
  );
  const widthStyle = $derived(
    width !== undefined
      ? `width: ${width}px; min-width: ${width}px; max-width: ${width}px`
      : undefined,
  );
  const testId = 'workflows-summary-table-body-cell';

  const hideTooltip = (value: string | undefined) => {
    return (
      !truncate || (truncate && truncateValue(value).length <= TRUNCATE_LENGTH)
    );
  };
</script>

{#snippet renderFilterableTableCell(
  filterableCellProps: Pick<
    ComponentProps<typeof FilterableTableCell>,
    'attribute' | 'value' | 'href' | 'type'
  >,
)}
  <FilterableTableCell
    class={className}
    style={widthStyle}
    data-testid={testId}
    {truncate}
    {...filterableCellProps}
  />
{/snippet}

{#if filterableLabels.includes(label) || isCustomKeywordOrTextAttribute}
  {#if label === 'Type'}
    {@render renderFilterableTableCell({
      attribute: 'WorkflowType',
      value: workflow.name,
      href: routeForWorkflow({
        namespace,
        workflow: workflow.id,
        run: workflow.runId,
        archival,
      }),
    })}
  {:else if label === 'Workflow ID'}
    {@render renderFilterableTableCell({
      attribute: 'WorkflowId',
      value: workflow.id,
      href: routeForWorkflow({
        namespace,
        workflow: workflow.id,
        run: workflow.runId,
        archival,
      }),
    })}
  {:else if label === 'Run ID'}
    {@render renderFilterableTableCell({
      attribute: 'RunId',
      value: workflow.runId,
      href: routeForWorkflow({
        namespace,
        workflow: workflow.id,
        run: workflow.runId,
        archival,
      }),
    })}
  {:else if label === 'Deployment'}
    {@const deployment =
      workflow.searchAttributes?.indexedFields?.TemporalWorkerDeployment}
    {@render renderFilterableTableCell({
      attribute: 'TemporalWorkerDeployment',
      value: deployment && typeof deployment === 'string' ? deployment : '',
      href: deployment
        ? routeForWorkerDeployment({ namespace, deployment })
        : undefined,
    })}
  {:else if label === 'Deployment Version'}
    {@const version =
      workflow.searchAttributes?.indexedFields?.TemporalWorkerDeploymentVersion}
    {@render renderFilterableTableCell({
      attribute: 'TemporalWorkerDeploymentVersion',
      value: version && typeof version === 'string' ? version : '',
    })}
  {:else if label === 'Build ID'}
    {@const buildId =
      workflow?.searchAttributes?.indexedFields?.['TemporalWorkerBuildId'] ||
      getBuildIdFromVersion(
        workflow.searchAttributes?.indexedFields
          ?.TemporalWorkerDeploymentVersion,
      )}
    {@render renderFilterableTableCell({
      attribute: 'TemporalWorkerBuildId',
      value: buildId && typeof buildId === 'string' ? buildId : '',
    })}
  {:else if label === 'Versioning Behavior'}
    {@const behavior =
      workflow.searchAttributes?.indexedFields
        ?.TemporalWorkflowVersioningBehavior}
    {@render renderFilterableTableCell({
      attribute: 'TemporalWorkflowVersioningBehavior',
      value: behavior && typeof behavior === 'string' ? behavior : '',
    })}
  {:else if isCustomKeywordOrTextAttribute}
    {@const content = workflow.searchAttributes?.indexedFields?.[label]}
    {@render renderFilterableTableCell({
      attribute: label,
      value: typeof content === 'string' ? content : '',
      type: $customSearchAttributes[label],
    })}
  {:else if label === 'Scheduled By ID'}
    {@const scheduleId =
      workflow.searchAttributes?.indexedFields?.TemporalScheduledById}
    {@render renderFilterableTableCell({
      attribute: 'TemporalScheduledById',
      value: scheduleId && typeof scheduleId === 'string' ? scheduleId : '',
    })}
  {/if}
{:else}
  <td class={className} style={widthStyle} data-testid={testId}>
    {#if label === 'Status'}
      <WorkflowStatus
        status={workflow.status}
        delayed={isWorkflowDelayed(workflow)}
        taskFailure={isWorkflowTaskFailure(workflow)}
      />
    {:else if label === 'End'}
      <Timestamp
        dateTime={workflow.endTime}
        options={{ format: truncate ? 'short' : 'long' }}
      />
    {:else if label === 'Start'}
      <Timestamp
        dateTime={workflow.startTime}
        options={{ format: truncate ? 'short' : 'long' }}
      />
    {:else if label === 'Task Queue'}
      <Tooltip
        usePortal
        text={workflow.taskQueue}
        top
        class="min-w-0"
        hide={hideTooltip(workflow.taskQueue)}
      >
        {truncate ? truncateValue(workflow.taskQueue) : workflow.taskQueue}
      </Tooltip>
    {:else if label === 'Parent Namespace'}
      <Tooltip
        usePortal
        text={workflow?.parentNamespaceId ?? ''}
        top
        class="min-w-0"
        hide={hideTooltip(workflow?.parentNamespaceId)}
      >
        {truncate
          ? truncateValue(workflow?.parentNamespaceId ?? '')
          : (workflow?.parentNamespaceId ?? '')}
      </Tooltip>
    {:else if label === 'History Size'}
      {formatBytes(parseInt(workflow.historySizeBytes, 10))}
    {:else if label === 'State Transitions'}
      {parseInt(workflow.stateTransitionCount, 10) > 0
        ? workflow.stateTransitionCount
        : ''}
    {:else if label === 'Execution Time'}
      <Timestamp
        dateTime={workflow.executionTime}
        options={{ format: truncate ? 'short' : 'long' }}
      />
    {:else if label === 'Execution Duration'}
      {formatDistanceAbbreviated({
        start: workflow?.startTime,
        end: workflow?.endTime,
        includeMilliseconds: true,
      })}
    {:else if label === 'History Length'}
      {parseInt(workflow.historyEvents, 10) > 0 ? workflow.historyEvents : ''}
    {:else if label === 'Scheduled Start Time'}
      {@const content =
        workflow.searchAttributes?.indexedFields?.TemporalScheduledStartTime}
      {#if content && typeof content === 'string'}
        <Timestamp
          dateTime={content}
          options={{ format: truncate ? 'short' : 'long' }}
        />
      {/if}
    {:else if label === 'Change Version'}
      {workflow.searchAttributes?.indexedFields?.TemporalChangeVersion}
    {:else if isCustomSearchAttribute(label) && workflowIncludesSearchAttribute(workflow, label)}
      {@const content = workflow.searchAttributes?.indexedFields?.[label]}
      {#if $customSearchAttributes[label] === SEARCH_ATTRIBUTE_TYPE.DATETIME && typeof content === 'string'}
        <Timestamp
          dateTime={content}
          options={{ format: truncate ? 'short' : 'long' }}
        />
      {:else if $customSearchAttributes[label] === SEARCH_ATTRIBUTE_TYPE.BOOL}
        <Badge>{content}</Badge>
      {:else}
        <Tooltip
          usePortal
          text={content}
          top
          class="min-w-0"
          hide={hideTooltip(content)}
        >
          {truncate ? truncateValue(content) : content}
        </Tooltip>
      {/if}
    {/if}
  </td>
{/if}
