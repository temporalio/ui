<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import { page } from '$app/state';

  import Timestamp from '$lib/components/timestamp.svelte';
  import WorkflowStatusBadge from '$lib/components/workflow/workflow-status-badge.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { Badge } from '$lib/io/badge';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import {
    SEARCH_ATTRIBUTE_TYPE,
    type WorkflowExecution,
  } from '$lib/types/workflows';
  import {
    COLUMN_WIDTH_CLAMP_CLASSES,
    columnWidthStyle,
  } from '$lib/utilities/column-width';
  import { isWorkflowDelayed } from '$lib/utilities/delayed-workflows';
  import { formatBytes } from '$lib/utilities/format-bytes';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { toQuickFilterValue } from '$lib/utilities/query/quick-filter';
  import {
    routeForWorkerDeployment,
    routeForWorkflow,
  } from '$lib/utilities/route-for';
  import {
    TRUNCATE_LENGTH,
    truncateValue,
  } from '$lib/utilities/truncate-value';
  import { isWorkflowTaskFailure } from '$lib/utilities/workflow-task-failures';

  import {
    ARCHIVAL_FILTERABLE_COLUMNS,
    getWorkflowColumnAttribute,
    getWorkflowColumnValue,
  } from './column-search-attributes';

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

  const attribute = $derived(getWorkflowColumnAttribute(label));
  const type = $derived($searchAttributes[attribute]);
  const value = $derived(getWorkflowColumnValue(label, workflow));
  const filterable = $derived(
    (!archival || ARCHIVAL_FILTERABLE_COLUMNS.includes(label)) &&
      toQuickFilterValue({ attribute, type, value }) !== null,
  );

  const href = $derived.by(() => {
    if (['Type', 'Workflow ID', 'Run ID'].includes(label)) {
      return routeForWorkflow({
        namespace,
        workflow: workflow.id,
        run: workflow.runId,
        archival,
      });
    }
    if (label === 'Deployment' && value) {
      return routeForWorkerDeployment({ namespace, deployment: String(value) });
    }
    return undefined;
  });

  const displayValue = $derived(value === undefined ? '' : String(value));

  const className = $derived(
    twMerge(
      'relative h-8 whitespace-nowrap',
      width !== undefined && COLUMN_WIDTH_CLAMP_CLASSES,
    ),
  );
  const widthStyle = $derived(columnWidthStyle(width));
  const testId = 'workflows-summary-table-body-cell';

  const hideTooltip = (value: string | undefined) => {
    return (
      !truncate || (truncate && truncateValue(value).length <= TRUNCATE_LENGTH)
    );
  };
</script>

{#snippet text(content: string)}
  <Tooltip
    usePortal
    text={content}
    top
    class="min-w-0"
    hide={hideTooltip(content)}
  >
    {#if href}
      <Link {href}>{truncate ? truncateValue(content) : content}</Link>
    {:else}
      {truncate ? truncateValue(content) : content}
    {/if}
  </Tooltip>
{/snippet}

{#snippet cellContent()}
  {#if label === 'Status'}
    <WorkflowStatusBadge
      status={workflow.status}
      delayed={isWorkflowDelayed(workflow)}
      taskFailure={isWorkflowTaskFailure(workflow)}
    />
  {:else if label === 'Start' || label === 'End' || label === 'Execution Time' || label === 'Scheduled Start Time'}
    <Timestamp dateTime={displayValue} />
  {:else if label === 'History Size'}
    {formatBytes(parseInt(workflow.historySizeBytes, 10))}
  {:else if label === 'State Transitions' || label === 'History Length'}
    {displayValue}
  {:else if label === 'Execution Duration'}
    {formatDistanceAbbreviated({
      start: workflow?.startTime,
      end: workflow?.endTime,
      includeMilliseconds: true,
    })}
  {:else if label === 'Parent Namespace'}
    {@render text(workflow?.parentNamespaceId ?? '')}
  {:else if type === SEARCH_ATTRIBUTE_TYPE.DATETIME}
    <Timestamp dateTime={displayValue} />
  {:else if type === SEARCH_ATTRIBUTE_TYPE.BOOL}
    <Badge text={displayValue} />
  {:else}
    {@render text(displayValue)}
  {/if}
{/snippet}

{#if filterable}
  <FilterableTableCell
    class={className}
    style={widthStyle}
    data-testid={testId}
    {attribute}
    {type}
    {value}
    copyValue={displayValue}
    {truncate}
  >
    {@render cellContent()}
  </FilterableTableCell>
{:else}
  <td class={className} style={widthStyle} data-testid={testId}>
    {@render cellContent()}
  </td>
{/if}
