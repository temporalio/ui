<script lang="ts">
  import type { Writable } from 'svelte/store';

  import { twMerge } from 'tailwind-merge';

  import { page } from '$app/state';

  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import { ChipStatus } from '$lib/io/chip-status';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { fetchWorkflowCountByExecutionStatus } from '$lib/services/workflow-counts';
  import { workflowFilters } from '$lib/stores/filters';
  import { currentPageKey } from '$lib/stores/pagination';
  import {
    disableWorkflowCountsRefresh,
    workflowCount,
    refresh as workflowRefresh,
  } from '$lib/stores/workflows';
  import { getStatusAndCountOfGroup } from '$lib/utilities/get-group-status-and-count';
  import { getWorkflowStatusLabel } from '$lib/utilities/get-workflow-status-label';
  import { hasUnsupportedQuery } from '$lib/utilities/query/column-filter';
  import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
  import { addStatusCountFilter } from '$lib/utilities/query/quick-filter';
  import { combineFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import {
    createStatusCountsState,
    type Status,
    type StatusCountDataProps,
  } from './status-counts-state.svelte';

  interface Props extends StatusCountDataProps {
    filters?: Writable<SearchAttributeFilter[]>;
  }

  let {
    staticQuery = '',
    refreshTime = $bindable(),
    countStore = workflowCount,
    refresh = workflowRefresh,
    filters = workflowFilters,
    fetchCounts = fetchWorkflowCountByExecutionStatus,
    getStatusAndCount = getStatusAndCountOfGroup,
    'data-testid': testId = 'workflow-status',
    disableRefresh = disableWorkflowCountsRefresh,
    class: className,
  }: Props = $props();

  const queryParam = $derived(page.url.searchParams.get('query'));
  const namespace = $derived(page.params.namespace ?? '');
  const query = $derived(staticQuery || queryParam || '');
  const perPage = $derived(page.url.searchParams.get('per-page'));

  const statusCounts = createStatusCountsState({
    getNamespace: () => namespace,
    getQuery: () => query,
    getPerPage: () => perPage,
    getRefresh: () => $refresh,
    getCountStore: () => countStore,
    isRefreshDisabled: () => $disableRefresh,
    getFetchCounts: () => fetchCounts,
    getStatusAndCount: () => getStatusAndCount,
  });

  $effect(function propagateRefreshTimeChange() {
    refreshTime = new Date(statusCounts.refreshTime);
  });

  const unsupportedQuery = $derived(hasUnsupportedQuery($filters));

  const onStatusClick = (status: Status) => {
    const next = addStatusCountFilter($filters, status);
    if (next) {
      $filters = next;
      const searchQuery = toListWorkflowQueryFromFilters(
        combineFilters($filters),
      );
      updateQueryParameters({
        url: page.url,
        parameter: 'query',
        value: searchQuery,
        clearParameters: [currentPageKey],
      });
    }
  };
</script>

<div
  class={twMerge(
    'flex min-h-[24px] flex-wrap items-center gap-2 pt-1',
    className,
  )}
  aria-busy={statusCounts.loading}
>
  {#each statusCounts.items as { count, difference, status } (status)}
    {#if !statusCounts.loading}
      {#if status}
        <ChipStatus
          {status}
          text={getWorkflowStatusLabel(status)}
          {count}
          extension={difference || undefined}
          onclick={() => onStatusClick(status)}
          disabled={unsupportedQuery}
          data-testid={`${testId}-${status}`}
        />
      {/if}
    {:else}
      <Skeleton class="h-6 w-24 rounded-sm" />
    {/if}
  {/each}
</div>
