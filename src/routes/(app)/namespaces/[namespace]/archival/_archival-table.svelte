<script lang="ts">
  import { page } from '$app/state';

  import DownloadJsonButton from '$lib/components/download-json-button.svelte';
  import TableBodyCell from '$lib/components/workflow/workflows-summary-configurable-table/table-body-cell.svelte';
  import TableHeaderCell from '$lib/components/workflow/workflows-summary-configurable-table/table-header-cell.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchPaginatedArchivedWorkflows } from '$lib/services/workflow-service';
  import { DEFAULT_WORKFLOWS_COLUMNS } from '$lib/stores/configurable-table-columns';

  const namespace = $derived(page.params.namespace);
  const query = $derived(page.url.searchParams.get('query') ?? undefined);

  const onFetch = $derived(() =>
    fetchPaginatedArchivedWorkflows(namespace, query ?? undefined),
  );

  const columns = $derived(DEFAULT_WORKFLOWS_COLUMNS);
</script>

{#key [namespace, query]}
  <PaginatedTable
    {onFetch}
    let:visibleItems
    aria-label={translate('common.workflows')}
    pageSizeSelectLabel={translate('common.per-page')}
    nextButtonLabel={translate('common.next')}
    previousButtonLabel={translate('common.previous')}
    emptyStateMessage={translate('workflows.empty-state-title')}
  >
    <tr slot="headers">
      {#each columns as column, i (`${column.label}:${i}`)}
        <TableHeaderCell {column} />
      {/each}
    </tr>
    {#each visibleItems as workflow (`${workflow.id}:${workflow.runId}`)}
      <tr data-testid="workflows-summary-configurable-table-row" class="dense">
        {#each columns as column, i (`${workflow.id}:${workflow.runId}:${column.label}:${i}`)}
          <TableBodyCell {workflow} {column} archival />
        {/each}
      </tr>
    {/each}
    <svelte:fragment slot="actions-end-additional" let:visibleItems let:page>
      <DownloadJsonButton
        items={visibleItems}
        {page}
        filePrefix="workflows"
        testId="export-history-button"
      />
    </svelte:fragment>
  </PaginatedTable>
{/key}
