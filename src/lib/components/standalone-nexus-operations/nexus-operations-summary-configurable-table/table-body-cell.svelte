<script lang="ts">
  import { page } from '$app/state';

  import Timestamp from '$lib/components/timestamp.svelte';
  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import type { ConfigurableTableHeader } from '$lib/stores/configurable-table-columns';
  import type { NexusOperationExecutionListInfo } from '$lib/types/nexus-operation-execution';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { toNexusOperationStatus } from '$lib/utilities/get-nexus-operation-status-and-count';
  import { routeForStandaloneNexusOperationDetails } from '$lib/utilities/route-for';

  import FilterableTableCell from './filterable-table-cell.svelte';

  type Props = {
    column: ConfigurableTableHeader;
    operation: NexusOperationExecutionListInfo;
  };
  let { column, operation }: Props = $props();

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
    'Operation ID',
    'Run ID',
    'Endpoint',
    'Service',
    'Operation',
  ];
</script>

{#if filterableLabels.includes(label)}
  <td
    class="relative h-8 whitespace-nowrap pr-24"
    data-testid="nexus-operations-summary-table-body-cell"
    onmouseover={showFilterOrCopy}
    onfocus={showFilterOrCopy}
    onfocusin={showFilterOrCopy}
    onfocusout={handleFocusOut}
    onmouseleave={hideFilterOrCopy}
    onblur={hideFilterOrCopy}
  >
    {#if label === 'Operation ID'}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute="OperationId"
        value={operation.operationId}
        href={routeForStandaloneNexusOperationDetails({
          namespace,
          operationId: operation.operationId,
          runId: operation.runId,
        })}
      />
    {:else if label === 'Run ID'}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute="RunId"
        value={operation.runId}
        href={routeForStandaloneNexusOperationDetails({
          namespace,
          operationId: operation.operationId,
          runId: operation.runId,
        })}
      />
    {:else if label === 'Endpoint'}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute="Endpoint"
        value={operation.endpoint ?? ''}
      />
    {:else if label === 'Service'}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute="Service"
        value={operation.service ?? ''}
      />
    {:else if label === 'Operation'}
      <FilterableTableCell
        {filterOrCopyButtonsVisible}
        attribute="Operation"
        value={operation.operation ?? ''}
      />
    {/if}
  </td>
{:else}
  <td
    class="h-8 whitespace-nowrap"
    data-testid="nexus-operations-summary-table-body-cell"
  >
    {#if label === 'Status'}
      <WorkflowStatus status={toNexusOperationStatus(operation.status)} />
    {:else if label === 'Schedule Time'}
      <Timestamp dateTime={operation.scheduleTime} />
    {:else if label === 'Close Time'}
      <Timestamp dateTime={operation.closeTime} />
    {:else if label === 'Execution Duration'}
      {#if operation.executionDuration}
        {formatDistanceAbbreviated({
          start: operation.scheduleTime,
          end: operation.closeTime,
          includeMilliseconds: true,
        })}
      {/if}
    {:else if label === 'State Transitions'}
      {operation.stateTransitionCount ?? ''}
    {/if}
  </td>
{/if}
