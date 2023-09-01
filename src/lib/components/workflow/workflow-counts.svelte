<script lang="ts">
  import { page } from '$app/stores';

  import type { WorkflowFilter } from '$lib/models/workflow-filters';
  import { workflowStatuses } from '$lib/models/workflow-status';
  import { workflowFilters } from '$lib/stores/filters';
  import { workflowsQuery } from '$lib/stores/workflows';
  import { decodePayload } from '$lib/utilities/decode-payload';
  import { isStatusFilter } from '$lib/utilities/query/filter-search';
  import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
  import { combineFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { requestFromAPI } from '$lib/utilities/request-from-api';
  import { routeForApi } from '$lib/utilities/route-for-api';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import WorkflowCount from './workflow-count.svelte';

  let totalCount = 0;
  let statusGroups = [];

  $: groupByEnabled =
    $page.data?.systemInfo?.capabilities?.countGroupByExecutionStatus;

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

  const fetchCounts = async () => {
    if (groupByEnabled) {
      const groupByClause = 'GROUP BY ExecutionStatus';
      const countRoute = routeForApi('workflows.count', {
        namespace: $page.params.namespace,
      });
      const { count, groups } = await requestFromAPI<{
        count: string;
        groups: unknown[];
      }>(countRoute, {
        params: { query: `${groupByClause}` },
        notifyOnError: false,
      });
      totalCount = parseInt(count);
      statusGroups = groups.map((group) => {
        const value = decodePayload(group?.groupValues[0]);
        return {
          value,
          count: parseInt(group.count),
        };
      });
    }
  };

  $: $workflowsQuery, fetchCounts();
</script>

{#if groupByEnabled}
  <div class="flex gap-2 lg:gap-4 flex-wrap">
    <WorkflowCount
      status="all"
      count={totalCount}
      {onStatusClick}
      active={!$workflowFilters.length}
    />
    {#each workflowStatuses as status}
      <WorkflowCount
        {status}
        {onStatusClick}
        count={statusGroups.find((group) => group.value === status)?.count ?? 0}
        active={statusFilters.some((filter) => filter.value === status)}
      />
    {/each}
  </div>
{/if}
