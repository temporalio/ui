<script lang="ts">
  import { page } from '$app/state';

  import TableEmptyState from '$lib/components/workflow/workflows-summary-configurable-table/table-empty-state.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchPaginatedArchivedWorkflows } from '$lib/services/workflow-service';
  import { queryWithParentWorkflowId } from '$lib/stores/workflows';
  import { exportWorkflows } from '$lib/utilities/export-workflows';

  const namespace = page.params.namespace;
  $: onFetch = () =>
    fetchPaginatedArchivedWorkflows(namespace, $queryWithParentWorkflowId);

  const columns = [
    { label: translate('common.status'), key: 'status' },
    { label: translate('common.workflow-id'), key: 'id' },
    { label: translate('common.workflow-type'), key: 'name' },
    { label: translate('common.run-id'), key: 'runId' },
    { label: translate('common.start-time'), key: 'startTime' },
    { label: translate('common.end-time'), key: 'endTime' },
  ];
</script>

{#key [namespace]}
  <PaginatedTable
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
    <tr slot="headers" class="text-left">
      {#each columns as { label }}
        <th>{label}</th>
      {/each}
    </tr>
    {#each visibleItems as workflow}
      <TableRow>
        {#each columns as column (column.key)}
          <td>{workflow[column.key]}</td>
        {/each}
      </TableRow>
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
    </svelte:fragment>
  </PaginatedTable>
{/key}
