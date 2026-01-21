<script lang="ts">
  import { page } from '$app/state';

  import TableEmptyState from '$lib/components/activity/activities-summary-configurable-table/table-empty-state.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { fetchPaginatedActivities } from '$lib/services/standalone-activities';
  import { activityCount, activityRefresh } from '$lib/stores/activities';
  import { configurableTableColumns } from '$lib/stores/configurable-table-columns';

  import TableBodyCell from './activities-summary-configurable-table/table-body-cell.svelte';
  import TableHeaderCell from './activities-summary-configurable-table/table-header-cell.svelte';
  import TableHeaderRow from './activities-summary-configurable-table/table-header-row.svelte';
  import TableRow from './activities-summary-configurable-table/table-row.svelte';

  interface Props {
    onClickConfigure: () => void;
  }

  let { onClickConfigure }: Props = $props();

  const namespace = $derived(page.params.namespace);
  const columns = $derived(
    $configurableTableColumns?.[namespace]?.activities ?? [],
  );
  const query = $derived(page.url.searchParams.get('query'));

  const onFetch = $derived(() => fetchPaginatedActivities(namespace, query));
</script>

{#key [namespace, query, $activityRefresh]}
  <PaginatedTable
    total={$activityCount.count}
    {onFetch}
    let:visibleItems
    aria-label={translate('activities.standalone-activities')}
    pageSizeSelectLabel={translate('common.per-page')}
    nextButtonLabel={translate('common.next')}
    previousButtonLabel={translate('common.previous')}
    emptyStateMessage={translate('activities.empty-state-title')}
    maxHeight="var(--panel-h)"
  >
    <caption class="sr-only" slot="caption">
      {translate('activities.standalone-activities')}
    </caption>
    <TableHeaderRow slot="headers">
      <th></th>
      {#each columns as column}
        <TableHeaderCell {column} />
      {/each}
    </TableHeaderRow>
    {#each visibleItems as activity}
      <TableRow {activity}>
        {#each columns as column}
          <TableBodyCell {activity} {column} />
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
          data-testid="activities-summary-table-configuration-button"
          size="xs"
          variant="ghost"
        >
          <Icon name="settings" />
        </Button>
      </Tooltip>
    </svelte:fragment>
  </PaginatedTable>
{/key}
