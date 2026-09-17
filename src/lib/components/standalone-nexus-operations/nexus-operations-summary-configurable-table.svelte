<script lang="ts">
  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconTemporalSettings } from '$lib/io/icon';
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
          <TableHeaderCell {column} />
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
