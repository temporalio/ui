<script lang="ts">
  import { page } from '$app/state';

  import ResetColumnWidthsButton from '$lib/components/table/reset-column-widths-button.svelte';
  import Button from '$lib/holocene/button.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconTemporalSettings } from '$lib/io/icon';
  import { createTableSort } from '$lib/runes/table-sort-state.svelte';
  import { fetchPaginatedNexusOperations } from '$lib/services/standalone-nexus-operations';
  import {
    configurableTableColumns,
    resizeColumn,
    TABLE_TYPE,
  } from '$lib/stores/configurable-table-columns';
  import {
    nexusOperationCount,
    nexusOperationLoading,
    nexusOperationRefresh,
  } from '$lib/stores/nexus-operations';
  import { nexusOperationSearchAttributes } from '$lib/stores/search-attributes';

  import { getNexusOperationSortColumns } from './nexus-operations-summary-configurable-table/column-search-attributes';

  import TableBodyCell from './nexus-operations-summary-configurable-table/table-body-cell.svelte';
  import TableEmptyState from './nexus-operations-summary-configurable-table/table-empty-state.svelte';
  import TableHeaderCell from './nexus-operations-summary-configurable-table/table-header-cell.svelte';
  import TableHeaderRow from './nexus-operations-summary-configurable-table/table-header-row.svelte';
  import TableRow from './nexus-operations-summary-configurable-table/table-row.svelte';

  interface Props {
    onClickConfigure: () => void;
    countLoaded?: boolean;
  }

  let { onClickConfigure, countLoaded = true }: Props = $props();

  const namespace = $derived(page.params.namespace);
  const columns = $derived(
    $configurableTableColumns?.[namespace]?.['nexus-operations'] ?? [],
  );
  const query = $derived(page.url.searchParams.get('query') ?? '');

  const tableSort = createTableSort(() => [namespace, query]);

  const onFetch = $derived(() =>
    fetchPaginatedNexusOperations(namespace, query),
  );
  const awaitingCount = $derived(!query && !countLoaded);
  const sortColumns = $derived(
    getNexusOperationSortColumns(
      columns.map((column) => column.label),
      $nexusOperationSearchAttributes,
    ),
  );
</script>

{#key [namespace, query, $nexusOperationRefresh]}
  <PaginatedTable
    total={$nexusOperationCount.count}
    bind:sort={tableSort.value}
    {sortColumns}
    {onFetch}
    loading={awaitingCount}
    aria-label={translate(
      'standalone-nexus-operations.standalone-nexus-operations',
    )}
    pageSizeSelectLabel={translate('common.per-page')}
    nextButtonLabel={translate('common.next')}
    previousButtonLabel={translate('common.previous')}
    emptyStateMessage={translate(
      'standalone-nexus-operations.empty-state-title',
    )}
    onLoadingChange={(loading) => {
      $nexusOperationLoading = loading;
    }}
  >
    {#snippet caption()}
      <caption class="sr-only">
        {translate('standalone-nexus-operations.nexus-operations-table')}
      </caption>
    {/snippet}
    {#snippet headers()}
      <TableHeaderRow>
        <th></th>
        {#each columns as column (column.label)}
          <TableHeaderCell
            {column}
            onResize={(width) =>
              resizeColumn(
                column.label,
                width,
                namespace,
                TABLE_TYPE.NEXUS_OPERATIONS,
              )}
          />
        {/each}
      </TableHeaderRow>
    {/snippet}
    {#snippet rows({ visibleItems })}
      {#each visibleItems as operation (operation.operationId + '-' + operation.runId)}
        <TableRow {operation}>
          {#each columns as column (column.label)}
            <TableBodyCell {operation} {column} />
          {/each}
        </TableRow>
      {/each}
    {/snippet}
    {#snippet empty()}
      <TableEmptyState />
    {/snippet}
    {#snippet actionsEndAdditional()}
      <ResetColumnWidthsButton
        {columns}
        {namespace}
        table={TABLE_TYPE.NEXUS_OPERATIONS}
      />
      <Tooltip text={translate('common.configure-columns')} top>
        <Button
          onclick={onClickConfigure}
          data-testid="nexus-operations-summary-table-configuration-button"
          size="xs"
          variant="ghost"
          aria-label={translate('common.configure-columns')}
          data-track-name="configure-columns-table-control"
          data-track-intent="action"
          data-track-text={translate('common.configure-columns')}
        >
          <IconTemporalSettings />
        </Button>
      </Tooltip>
    {/snippet}
  </PaginatedTable>
{/key}
