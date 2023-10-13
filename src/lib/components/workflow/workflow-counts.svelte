<script lang="ts">
  import { page } from '$app/stores';

  import { workflowFilters } from '$lib/stores/filters';
  import { groupByCountEnabled } from '$lib/stores/group-by-enabled';
  import { workflowCount, workflowsQuery } from '$lib/stores/workflows';
  import type { Payloads } from '$lib/types';
  import type { WorkflowStatus } from '$lib/types/workflows';
  import { decodePayload } from '$lib/utilities/decode-payload';
  import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/filter-workflow-query';
  import { combineFilters } from '$lib/utilities/query/to-list-workflow-filters';
  import { requestFromAPI } from '$lib/utilities/request-from-api';
  import { routeForApi } from '$lib/utilities/route-for-api';

  import WorkflowCountAll from './workflow-count-all.svelte';
  import WorkflowCountStatus from './workflow-count-status.svelte';

  $: namespace = $page.params.namespace;
  let totalCount = 0;
  let statusGroups: { status: WorkflowStatus; count: number }[] = [];

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
        groups: { groupValues: Payloads; count: string }[];
      }>(countRoute, {
        params: { query: `${query} ${groupByClause}` },
        notifyOnError: false,
      });
      totalCount = parseInt(count);
      $workflowCount.totalCount = totalCount;
      statusGroups = groups
        .map((group) => {
          const status = decodePayload(
            group?.groupValues[0],
          ) as unknown as WorkflowStatus;
          const count = parseInt(group.count);
          return {
            status,
            count,
          };
        })
        .filter((s) => s.count > 0);
    }
  };

  $: $workflowsQuery, namespace, fetchCounts();
</script>

<div class="flex flex-wrap items-center gap-2">
  <WorkflowCountAll count={totalCount} />
  {#each statusGroups as { count, status } (status)}
    <WorkflowCountStatus {status} {count} />
  {/each}
</div>
