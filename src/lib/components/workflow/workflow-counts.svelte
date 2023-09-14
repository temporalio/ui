<script lang="ts">
  import { page } from '$app/stores';

  import type { WorkflowFilter } from '$lib/models/workflow-filters';
  import { workflowStatuses } from '$lib/models/workflow-status';
  import { workflowFilters } from '$lib/stores/filters';
  import { groupByCountEnabled } from '$lib/stores/group-by-enabled';
  import { workflowCount, workflowsQuery } from '$lib/stores/workflows';
  import { decodePayload } from '$lib/utilities/decode-payload';
  import { isStatusFilter } from '$lib/utilities/query/filter-search';
  import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
  import { combineFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { requestFromAPI } from '$lib/utilities/request-from-api';
  import { routeForApi } from '$lib/utilities/route-for-api';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  import WorkflowCountAll from './workflow-count-all.svelte';
  import WorkflowCountStatus from './workflow-count-status.svelte';

  $: namespace = $page.params.namespace;

  let totalCount = 0;
  let statusGroups = [];

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
      $workflowFilters = $workflowFilters.filter(
        (f) => !isStatusFilter(f.attribute),
      );
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
    if (groupByCountEnabled) {
      const groupByClause = 'GROUP BY ExecutionStatus';
      const countRoute = routeForApi('workflows.count', {
        namespace,
      });

      const query = toListWorkflowQueryFromFilters(
        combineFilters(
          $workflowFilters.filter((f) => !isStatusFilter(f.attribute)),
        ),
      );
      const { count, groups } = await requestFromAPI<{
        count: string;
        groups: unknown[];
      }>(countRoute, {
        params: { query: `${query} ${groupByClause}` },
        notifyOnError: false,
      });
      totalCount = parseInt(count);
      $workflowCount.totalCount = totalCount;
      statusGroups = groups.map((group) => {
        const value = decodePayload(group?.groupValues[0]);
        const count = parseInt(group.count);
        // if ()
        return {
          value,
          count,
        };
      });
    }
  };

  $: $workflowsQuery, namespace, fetchCounts();
</script>

{#if groupByCountEnabled}
  <div class="flex flex flex-wrap gap-1">
    <WorkflowCountAll
      count={totalCount}
      {onStatusClick}
      active={!$workflowFilters.length}
    />
    {#each workflowStatuses as status}
      <WorkflowCountStatus
        {status}
        {onStatusClick}
        count={statusGroups.find((group) => group.value === status)?.count ?? 0}
        active={statusFilters.some((filter) => filter.value === status)}
      />
    {/each}
  </div>
{/if}
