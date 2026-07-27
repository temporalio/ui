<script lang="ts">
  import { page } from '$app/state';

  import TableBodyCell from '$lib/components/workflow/workflows-summary-configurable-table/table-body-cell.svelte';
  import TableHeaderCell from '$lib/components/workflow/workflows-summary-configurable-table/table-header-cell.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchPaginatedArchivedWorkflows } from '$lib/services/workflow-service';
  import { DEFAULT_WORKFLOWS_COLUMNS } from '$lib/stores/configurable-table-columns';
  import { exportWorkflows } from '$lib/utilities/export-workflows';

  const namespace = $derived(page.params.namespace);
  const query = $derived(page.url.searchParams.get('query'));

  const onFetch = $derived(() =>
    fetchPaginatedArchivedWorkflows(namespace, query),
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
      {#each columns as column}
        <TableHeaderCell {column} />
      {/each}
    </tr>
    {#each visibleItems as workflow (`${workflow.id}:${workflow.runId}`)}
      <tr data-testid="workflows-summary-configurable-table-row" class="dense">
        {#each columns as column}
          <TableBodyCell {workflow} {column} archival />
        {/each}
      </tr>
    {/each}
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
