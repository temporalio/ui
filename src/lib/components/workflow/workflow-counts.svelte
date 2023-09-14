<script lang="ts">
import { page } from '$app/stores';

import { workflowStatuses } from '$lib/models/workflow-status';
import { workflowFilters } from '$lib/stores/filters';
import { groupByCountEnabled } from '$lib/stores/group-by-enabled';
import { workflowCount, workflowsQuery } from '$lib/stores/workflows';
import { decodePayload } from '$lib/utilities/decode-payload';
import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
import { combineFilters } from '$lib/utilities/query/to-list-workflow-filters';
import { requestFromAPI } from '$lib/utilities/request-from-api';
import { routeForApi } from '$lib/utilities/route-for-api';

import WorkflowCountAll from './workflow-count-all.svelte';
import WorkflowCountStatus from './workflow-count-status.svelte';

$: namespace = $page.params.namespace;

let totalCount = 0;
let statusGroups = [];

const fetchCounts = async () => {
  if (groupByCountEnabled) {
    const groupByClause = 'GROUP BY ExecutionStatus';
    const countRoute = routeForApi('workflows.count', {
      namespace,
    });

    const query = toListWorkflowQueryFromFilters(
      combineFilters($workflowFilters),
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
    <WorkflowCountAll count={totalCount} />
    {#each workflowStatuses as status}
      <WorkflowCountStatus
        status={status}
        count={statusGroups.find((group) => group.value === status)?.count ?? 0}
      />
    {/each}
  </div>
{/if}
