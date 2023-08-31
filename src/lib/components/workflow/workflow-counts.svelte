<script lang="ts">
  import { page } from '$app/stores';

  import type { WorkflowFilter } from '$lib/models/workflow-filters';
  import { workflowStatuses } from '$lib/models/workflow-status';
  import { workflowFilters } from '$lib/stores/filters';
  import { isStatusFilter } from '$lib/utilities/query/filter-search';
  import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
  import { combineFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { requestFromAPI } from '$lib/utilities/request-from-api';
  import { routeForApi } from '$lib/utilities/route-for-api';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { noop } from 'svelte/internal';

  import WorkflowCount from './workflow-count.svelte';

  $: statusFilters = $workflowFilters.filter((filter) =>
    isStatusFilter(filter.attribute),
  );

  function mapStatusToFilter(value: string) {
    return {
      attribute: 'ExecutionStatus',
      value,
      operator: '',
      parenthesis: '',
      conditional: '=',
    };
  }

  function mapStatusesToFilters(filters: WorkflowFilter[]) {
    if (filters.length === 1) {
      return [mapStatusToFilter(filters[0].value)];
    } else {
      return filters.map((filter, i) => {
        const operator = i === filters.length - 1 ? '' : 'OR';
        return {
          ...filter,
          operator,
        };
      });
    }
  }

  const onStatusClick = (status: string) => {
    if (status === 'all') {
      $workflowFilters = [];
    } else {
      if (statusFilters.find((s) => s.value === status)) {
        const nonStatusFilters = $workflowFilters.filter(
          (f) => !isStatusFilter(f.attribute),
        );
        $workflowFilters = [
          ...nonStatusFilters,
          ...mapStatusesToFilters(
            statusFilters.filter((s) => s.value !== status),
          ),
        ];
      } else {
        if (!statusFilters.length) {
          $workflowFilters = [...$workflowFilters, mapStatusToFilter(status)];
        } else {
          const nonStatusFilters = $workflowFilters.filter(
            (f) => !isStatusFilter(f.attribute),
          );
          $workflowFilters = [
            ...nonStatusFilters,
            ...mapStatusesToFilters([
              ...statusFilters,
              mapStatusToFilter(status),
            ]),
          ];
        }
      }
    }

    const searchQuery = toListWorkflowQueryFromFilters(
      combineFilters($workflowFilters),
    );
    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: searchQuery,
      allowEmpty: true,
    });
  };

  const groupByClause = 'GROUP BY ExecutionStatus';

  const countRoute = routeForApi('workflows.count', {
    namespace: $page.params.namespace,
  });
  const countPromise = requestFromAPI<{ count: string }>(countRoute, {
    params: { query: '' },
    notifyOnError: false,
  });
</script>

{#await countPromise then { count, groups }}
  {(console.log('Count and groups: ', count, groups), '')}
  <div class="flex gap-2 lg:gap-4 flex-wrap">
    <WorkflowCount
      status="all"
      count={parseInt(count || '0')}
      {onStatusClick}
      active={!$workflowFilters.length}
    />
    {#each workflowStatuses as status}
      <WorkflowCount
        {status}
        {onStatusClick}
        active={statusFilters.some((filter) => filter.value === status)}
      />
    {/each}
  </div>
{/await}
