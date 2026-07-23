<script lang="ts">
  import { getContext } from 'svelte';

  import { page } from '$app/state';

  import DownloadJsonButton from '$lib/components/download-json-button.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import PaginatedTable from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    ACTIVITY_BATCH_OPERATION_CONTEXT,
    type ActivityBatchOperationContext,
    activityKey,
  } from '$lib/pages/standalone-activities.svelte';
  import { fetchPaginatedActivities } from '$lib/services/standalone-activities';
  import { activityCount, activityRefresh } from '$lib/stores/activities';
  import { supportsAdvancedVisibility } from '$lib/stores/advanced-visibility';
  import { configurableTableColumns } from '$lib/stores/configurable-table-columns';
  import type { ActivityExecutionInfo } from '$lib/types/activity-execution';
  import {
    getBatchSelectionTargets,
    getPageSelectionStatus,
    type PageSelectionStatus,
  } from '$lib/utilities/batch-selection';
  import { standaloneActivityBulkActionsEnabled } from '$lib/utilities/standalone-activities-commands-disabled';

  import TableBodyCell from './activities-summary-configurable-table/table-body-cell.svelte';
  import TableEmptyState from './activities-summary-configurable-table/table-empty-state.svelte';
  import TableHeaderCell from './activities-summary-configurable-table/table-header-cell.svelte';
  import TableHeaderRow from './activities-summary-configurable-table/table-header-row.svelte';
  import TableRow from './activities-summary-configurable-table/table-row.svelte';

  interface Props {
    onClickConfigure: () => void;
  }

  let { onClickConfigure }: Props = $props();

  const { allSelected, selectedActivities, selectActivities } =
    getContext<ActivityBatchOperationContext>(ACTIVITY_BATCH_OPERATION_CONTEXT);

  const namespace = $derived(page.params.namespace);
  const columns = $derived(
    $configurableTableColumns?.[namespace]?.activities ?? [],
  );
  const query = $derived(page.url.searchParams.get('query') ?? '');

  const onFetch = $derived(() => fetchPaginatedActivities(namespace, query));

  const showBatchActions = $derived(
    standaloneActivityBulkActionsEnabled(page) && $supportsAdvancedVisibility,
  );

  let visiblePaginatedItems: ActivityExecutionInfo[] = $state([]);

  const pageSelectionStatus: PageSelectionStatus = $derived(
    getPageSelectionStatus(
      visiblePaginatedItems.map(activityKey),
      new Set($selectedActivities.map(activityKey)),
      $allSelected,
    ),
  );

  let prevClickedIndex = $state<number | null>(null);

  const handleSelectPage = (
    isSelected: boolean,
    activities: ActivityExecutionInfo[],
  ) => {
    selectActivities(isSelected, activities);
    prevClickedIndex = null;

    if (!isSelected) {
      allSelected.set(false);
    }
  };

  const handleBatchSelect = (event: MouseEvent, visibleRowIndex: number) => {
    const selection = getBatchSelectionTargets(
      event,
      visiblePaginatedItems,
      visibleRowIndex,
      prevClickedIndex,
    );
    if (!selection) return;

    selectActivities(selection.isChecked, selection.targeted);
    prevClickedIndex = visibleRowIndex;
  };

  $effect(() => {
    void visiblePaginatedItems;
    void $allSelected;
    prevClickedIndex = null;
  });
</script>

{#key [namespace, query, $activityRefresh]}
  <PaginatedTable
    total={$activityCount.count}
    {onFetch}
    onItemsChange={(items) => {
      visiblePaginatedItems = items;
    }}
    aria-label={translate('standalone-activities.standalone-activities')}
    pageSizeSelectLabel={translate('common.per-page')}
    nextButtonLabel={translate('common.next')}
    previousButtonLabel={translate('common.previous')}
    emptyStateMessage={translate('standalone-activities.empty-state-title')}
  >
    <caption class="sr-only" slot="caption">
      {translate('standalone-activities.standalone-activities')}
    </caption>
    <TableHeaderRow
      slot="headers"
      activities={visiblePaginatedItems}
      empty={visiblePaginatedItems.length === 0}
      columnsCount={columns.length}
      {showBatchActions}
      {pageSelectionStatus}
      onSelectPage={handleSelectPage}
    >
      {#each columns as column, i (`${column.label}:${i}`)}
        <TableHeaderCell {column} />
      {/each}
    </TableHeaderRow>
    {#each visiblePaginatedItems as activity, visibleRowIndex (activityKey(activity))}
      <TableRow
        {activity}
        {showBatchActions}
        onClickBatchSelect={(event) =>
          handleBatchSelect(event, visibleRowIndex)}
      >
        {#each columns as column, i (`${column.label}:${i}`)}
          <TableBodyCell {activity} {column} />
        {/each}
      </TableRow>
    {/each}
    <svelte:fragment slot="empty">
      <TableEmptyState />
    </svelte:fragment>
    <svelte:fragment slot="actions-end-additional" let:visibleItems let:page>
      <DownloadJsonButton items={visibleItems} {page} filePrefix="activities" />
      <Tooltip text={translate('common.configure-columns')} top>
        <Button
          on:click={onClickConfigure}
          data-testid="activities-summary-table-configuration-button"
          size="xs"
          variant="ghost"
          aria-label={translate('common.configure-columns')}
        >
          <Icon name="settings" />
        </Button>
      </Tooltip>
    </svelte:fragment>
  </PaginatedTable>
{/key}
