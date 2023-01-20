<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { timeFormat } from '$lib/stores/time-format';
  import {
    workflowError,
    workflowsQuery,
    refresh,
  } from '$lib/stores/workflows';
  import { lastUsedNamespace } from '$lib/stores/namespaces';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';

  import { toListWorkflowFilters } from '$lib/utilities/query/to-list-workflow-filters';

  import WorkflowsSummaryTable from '$lib/components/workflow/workflows-summary-table.svelte';
  import WorkflowsSummaryRow from '$lib/components/workflow/workflows-summary-row.svelte';
  import ApiPagination from '$lib/holocene/api-pagination.svelte';
  import { fetchPaginatedWorkflows } from '$lib/services/workflow-service';
  import EmptyRow from './_empty-row.svelte';
  import { toListWorkflowQueryFromFilters } from '$lib/utilities/query/list-workflow-query';

  $: query = $page.url.searchParams.get('query');

  $: {
    // For returning to page from 'Back to Workflows' with previous search
    if (query) {
      $workflowsQuery = query;
    }
  }

  $: {
    if (!$workflowFilters.length && !$workflowSorts.length) {
      $workflowsQuery = '';
    }
  }

  onMount(() => {
    $lastUsedNamespace = $page.params.namespace;
    if (query) {
      // Set filters from inital page load query if it exists
      $workflowFilters = toListWorkflowFilters(query);
    } else {
      $workflowFilters = [];
    }
  });

  const errorMessage =
    'If you have filters applied, try adjusting them. Otherwise please check your syntax and try again.';

  // For Imagination Pagination
  export let activeTotal: number;
  export let activeStatus: WorkflowStatus;

  $: namespace = $page.params.namespace;

  $: onWorkflowFetch = async () => {
    return async (pageSize = 100, token) => {
      const executionStatusFilter = {
        attribute: 'ExecutionStatus',
        value: activeStatus,
        conditional: '=',
        operator: $workflowFilters.length ? 'AND' : '',
        parenthesis: '',
      };
      const query = toListWorkflowQueryFromFilters([
        executionStatusFilter,
        ...$workflowFilters,
      ]);

      const { workflows, nextPageToken, error } = await fetchPaginatedWorkflows(
        namespace,
        {
          query,
        },
        token,
        pageSize.toString(),
      );
      return { items: workflows, nextPageToken };
    };
  };
</script>

{#key [activeStatus, activeTotal, query, $refresh]}
  <section>
    <ApiPagination
      onFetch={onWorkflowFetch}
      total={activeTotal}
      let:visibleItems
    >
      <WorkflowsSummaryTable>
        {#each visibleItems as event}
          <WorkflowsSummaryRow
            workflow={event}
            namespace={$page.params.namespace}
            timeFormat={$timeFormat}
          />
        {/each}
      </WorkflowsSummaryTable>
      <div slot="empty">
        <WorkflowsSummaryTable>
          <EmptyRow loading={false} {errorMessage} error={$workflowError} />
        </WorkflowsSummaryTable>
      </div>
    </ApiPagination>
  </section>
{/key}
