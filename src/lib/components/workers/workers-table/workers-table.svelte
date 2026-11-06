<script lang="ts">
  import { page } from '$app/state';

  import ColumnHeaderFilter from '$lib/components/search-attribute-filter/column-header-filter.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import PaginatedTable, {
    type PaginatedRequest,
  } from '$lib/holocene/table/paginated-table/api-paginated.svelte';
  import SortableTableHeader from '$lib/holocene/table/sortable-table-header.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workerFilters } from '$lib/stores/filters';
  import { workerSearchAttributes } from '$lib/stores/search-attributes';
  import { workflowRun } from '$lib/stores/workflow-run';
  import type { WorkerHeartbeat, WorkerListInfo } from '$lib/types';
  import { isRunningWithNoWorkers } from '$lib/utilities/is-running-with-no-workers';
  import type { TableSort, TableSortColumn } from '$lib/utilities/table-sort';

  import {
    getWorkerColumnAttributes,
    getWorkerColumnFilter,
    getWorkerColumns,
  } from './column-search-attributes';

  import WorkerHeartbeatsSDKAlert from './worker-heartbeats-sdk-warning.svelte';
  import WorkersQueryEmptyState from './workers-query-empty-state.svelte';
  import WorkersTableRow from './workers-table-row.svelte';

  interface Props {
    filterable?: boolean;
    namespace: string;
    onFetch: () => Promise<PaginatedRequest<WorkerListInfo | WorkerHeartbeat>>;
    onError?: (err: unknown) => void;
    total?: number;
    sort?: TableSort;
  }

  let {
    filterable = false,
    namespace,
    onFetch,
    onError,
    total,
    sort = $bindable(),
  }: Props = $props();

  const columns = getWorkerColumns();
  const columnAttributes = getWorkerColumnAttributes(columns);

  const sortColumns: Record<
    string,
    TableSortColumn<WorkerListInfo | WorkerHeartbeat>
  > = Object.fromEntries(
    columns.map(({ label, getValue, type }) => [label, { getValue, type }]),
  );

  const hasQuery = $derived(page.url.searchParams.get('query') !== null);
  const runningWithNoWorkers = $derived(isRunningWithNoWorkers($workflowRun));
</script>

<PaginatedTable
  bind:sort
  {sortColumns}
  {onFetch}
  {onError}
  {total}
  aria-label={translate('workers.workers')}
  pageSizeSelectLabel={translate('common.per-page')}
  nextButtonLabel={translate('common.next')}
  previousButtonLabel={translate('common.previous')}
  emptyStateMessage={translate('workers.empty-state-title')}
  errorMessage={translate('workers.error-message-fetching')}
>
  {#snippet caption()}
    <caption class="sr-only">
      {translate('workers.workers')}
    </caption>
  {/snippet}

  {#snippet headers()}
    <tr class="text-left">
      {#each Object.keys(sortColumns) as label (label)}
        {@const columnFilter = filterable
          ? getWorkerColumnFilter(
              label,
              $workerSearchAttributes,
              columnAttributes,
            )
          : undefined}
        {#snippet filter()}
          {#if columnFilter}
            <ColumnHeaderFilter
              attribute={columnFilter.attribute}
              type={columnFilter.type}
              {label}
              filters={workerFilters}
            />
          {/if}
        {/snippet}
        <SortableTableHeader
          column={label}
          leading={columnFilter ? filter : undefined}
        />
      {/each}
    </tr>
  {/snippet}
  {#snippet rows({ visibleItems })}
    {#each visibleItems as worker, i (worker?.workerInstanceKey ?? i)}
      <WorkersTableRow {worker} {namespace} {filterable} />
    {/each}
  {/snippet}

  {#snippet empty()}
    <div class="flex h-full flex-col items-center justify-center">
      {#if hasQuery}
        <WorkersQueryEmptyState />
      {:else if runningWithNoWorkers}
        <EmptyState title={translate('workers.empty-state-title')} />
      {:else}
        <WorkerHeartbeatsSDKAlert />
      {/if}
    </div>
  {/snippet}
</PaginatedTable>
