<script lang="ts">
  import { page } from '$app/stores';

  import Button from '$lib/anthropocene/button.svelte';
  import TableEmptyState from '$lib/components/workflow/workflows-summary-configurable-table/table-empty-state.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    fetchAllChildWorkflows,
    fetchPaginatedWorkflows,
  } from '$lib/services/workflow-service';
  import { configurableTableColumns } from '$lib/stores/configurable-table-columns';
  import {
    queryWithParentWorkflowId,
    refresh,
    workflowCount,
  } from '$lib/stores/workflows';
  import type { WorkflowExecution } from '$lib/types/workflows';
  import { exportWorkflows } from '$lib/utilities/export-workflows';

  import TableBodyCell from './workflows-summary-configurable-table/table-body-cell.svelte';
  import TableHeaderCell from './workflows-summary-configurable-table/table-header-cell.svelte';
  import TableHeaderRow from './workflows-summary-configurable-table/table-header-row.svelte';
  import TableRow from './workflows-summary-configurable-table/table-row.svelte';

  export let onClickConfigure: () => void;

  $: ({ namespace } = $page.params);
  $: columns = $configurableTableColumns?.[namespace]?.workflows ?? [];

  let childrenIds: {
    workflowId: string;
    runId: string;
    children: WorkflowExecution[];
  }[] = [];

  const clearChildren = () => {
    childrenIds = [];
  };

  $: $refresh, $queryWithParentWorkflowId, clearChildren();

  const viewChildren = async (workflow: WorkflowExecution) => {
    if (childrenActive(workflow)) {
      childrenIds = childrenIds.filter(
        (id) => id.workflowId !== workflow.id && id.runId !== workflow.runId,
      );
    } else {
      const children = await fetchAllChildWorkflows(
        namespace,
        workflow.id,
        workflow.runId,
      );
      childrenIds = [
        { workflowId: workflow.id, runId: workflow.runId, children },
        ...childrenIds,
      ];
    }
  };

  $: childrenActive = (workflow: WorkflowExecution) => {
    return childrenIds.find(
      (id) => id.workflowId === workflow.id && id.runId === workflow.runId,
    );
  };

  $: onFetch = () =>
    fetchPaginatedWorkflows(namespace, $queryWithParentWorkflowId);
</script>

{#key [namespace, $queryWithParentWorkflowId, $refresh]}
  <PaginatedTable
    total={$workflowCount.count}
    {onFetch}
    let:visibleItems
    aria-label={translate('common.workflows')}
    pageSizeSelectLabel={translate('common.per-page')}
    nextButtonLabel={translate('common.next')}
    previousButtonLabel={translate('common.previous')}
    emptyStateMessage={translate('workflows.empty-state-title')}
  >
    <caption class="sr-only" slot="caption">
      {translate('common.workflows')}
    </caption>
    <TableHeaderRow
      columnsCount={columns.length}
      empty={visibleItems.length === 0}
      slot="headers"
      let:visibleItems
      workflows={visibleItems}
    >
      {#each columns as column}
        <TableHeaderCell {column} />
      {/each}
    </TableHeaderRow>
    {#each visibleItems as workflow}
      <TableRow
        {workflow}
        {viewChildren}
        childCount={childrenActive(workflow)?.children.length}
      >
        {#each columns as column}
          <TableBodyCell {workflow} {column} />
        {/each}
      </TableRow>
      {#if childrenActive(workflow)}
        {#each childrenActive(workflow).children as child}
          <TableRow workflow={child} child>
            {#each columns as column}
              <TableBodyCell workflow={child} {column} />
            {/each}
          </TableRow>
        {/each}
      {/if}
    {/each}
    <svelte:fragment slot="empty">
      <TableEmptyState>
        <slot name="cloud" slot="cloud" />
      </TableEmptyState>
    </svelte:fragment>
    <svelte:fragment slot="actions-end-additional" let:visibleItems let:page>
      <Tooltip text={translate('common.download-json')} top>
        <Button
          on:click={() => exportWorkflows(visibleItems, page)}
          data-testid="export-history-button"
          size="xs"
          variant="ghost"
        >
          <Icon name="download" />
        </Button>
      </Tooltip>
      <Tooltip text="Configure Columns" top>
        <Button
          on:click={onClickConfigure}
          data-testid="workflows-summary-table-configuration-button"
          size="xs"
          variant="ghost"
        >
          <Icon name="settings" />
        </Button>
      </Tooltip>
    </svelte:fragment>
  </PaginatedTable>
{/key}
