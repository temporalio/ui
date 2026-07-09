<script lang="ts">
  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchPaginatedNexusOperations } from '$lib/services/standalone-nexus-operations';
  import { configurableTableColumns } from '$lib/stores/configurable-table-columns';
  import {
    nexusOperationCount,
    nexusOperationLoading,
    nexusOperationRefresh,
  } from '$lib/stores/nexus-operations';

  import TableBodyCell from './nexus-operations-summary-configurable-table/table-body-cell.svelte';
  import TableEmptyState from './nexus-operations-summary-configurable-table/table-empty-state.svelte';
  import TableHeaderCell from './nexus-operations-summary-configurable-table/table-header-cell.svelte';
  import TableHeaderRow from './nexus-operations-summary-configurable-table/table-header-row.svelte';
  import TableRow from './nexus-operations-summary-configurable-table/table-row.svelte';

  interface Props {
    onClickConfigure: () => void;
  }

  let { onClickConfigure }: Props = $props();

  const namespace = $derived(page.params.namespace);
  const columns = $derived(
    $configurableTableColumns?.[namespace]?.['nexus-operations'] ?? [],
  );
  const query = $derived(page.url.searchParams.get('query') ?? '');

  const onFetch = $derived(() =>
    fetchPaginatedNexusOperations(namespace, query),
  );
</script>

{#key [namespace, query, $nexusOperationRefresh]}
  <PaginatedTable
    total={$nexusOperationCount.count}
    {onFetch}
    let:visibleItems
    aria-label={translate(
      'standalone-nexus-operations.standalone-nexus-operations',
    )}
    pageSizeSelectLabel={translate('common.per-page')}
    nextButtonLabel={translate('common.next')}
    previousButtonLabel={translate('common.previous')}
    emptyStateMessage={translate(
      'standalone-nexus-operations.empty-state-title',
    )}
    maxHeight="var(--panel-h)"
    onLoadingChange={(loading) => {
      $nexusOperationLoading = loading;
    }}
  >
    <caption class="sr-only" slot="caption">
      {translate('standalone-nexus-operations.nexus-operations-table')}
    </caption>
    <TableHeaderRow slot="headers">
      <th></th>
      {#each columns as column (column.label)}
        <TableHeaderCell {column} />
      {/each}
    </TableHeaderRow>
    {#each visibleItems as operation (operation.operationId + '-' + operation.runId)}
      <TableRow {operation}>
        {#each columns as column (column.label)}
          <TableBodyCell {operation} {column} />
        {/each}
      </TableRow>
    {/each}
    <svelte:fragment slot="empty">
      <TableEmptyState />
    </svelte:fragment>
    <svelte:fragment slot="actions-end-additional">
      <Tooltip text="Configure Columns" top>
        <Button
          on:click={onClickConfigure}
          data-testid="nexus-operations-summary-table-configuration-button"
          size="xs"
          variant="ghost"
        >
          <Icon name="settings" />
        </Button>
      </Tooltip>
    </svelte:fragment>
  </PaginatedTable>
{/key}
