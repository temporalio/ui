<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import { page } from '$app/state';

  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import { BadgeStatus } from '$lib/io/badge-status';
  import { fetchWorkflowCountByExecutionStatus } from '$lib/services/workflow-counts';
  import {
    disableWorkflowCountsRefresh,
    workflowCount,
    refresh as workflowRefresh,
  } from '$lib/stores/workflows';
  import { getStatusAndCountOfGroup } from '$lib/utilities/get-group-status-and-count';

  import {
    createStatusCountsState,
    type StatusCountDataProps,
  } from './status-counts-state.svelte';

  let {
    staticQuery = '',
    refreshTime = $bindable(),
    countStore = workflowCount,
    refresh = workflowRefresh,
    fetchCounts = fetchWorkflowCountByExecutionStatus,
    getStatusAndCount = getStatusAndCountOfGroup,
    'data-testid': testId = 'workflow-status',
    disableRefresh = disableWorkflowCountsRefresh,
    class: className,
  }: StatusCountDataProps = $props();

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
        <BadgeStatus
          {status}
          {count}
          extensions={difference
            ? [
                {
                  text: difference.toLocaleString(undefined, {
                    signDisplay: 'always',
                  }),
                },
              ]
            : undefined}
          data-testid={`${testId}-${status}`}
        />
      {/if}
    {:else}
      <Skeleton class="h-6 w-24 rounded-full" />
    {/if}
  {/each}
</div>
