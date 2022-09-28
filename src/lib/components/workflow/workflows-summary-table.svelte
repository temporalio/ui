<script lang="ts">
  import debounce from 'just-debounce';
  import { page } from '$app/stores';

  import { timeFormat } from '$lib/stores/time-format';

  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { toListWorkflowParameters } from '$lib/utilities/query/to-list-workflow-parameters';
  import {
    toListWorkflowQuery,
    toListWorkflowQueryFromAdvancedFilters,
  } from '$lib/utilities/query/list-workflow-query';

  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import WorkflowStatusDropdownFilter from './dropdown-filter/workflow-status.svelte';
  import WorkflowIdDropdownFilter from './dropdown-filter/workflow-id.svelte';
  import WorkflowTypeDropdownFilter from './dropdown-filter/workflow-type.svelte';

  export let updating = false;
  let filters = [];
  let sorts = [];
  let statusFilters = [];
  let workflowIdFilter = [];
  let workflowTypeFilter = [];

  const defaultQuery = toListWorkflowQuery({ timeRange: 'All' });
  $: query = $page.url.searchParams.get('query');
  $: parameters = toListWorkflowParameters(query ?? defaultQuery);

  const combineFilters = (filter1, filter2, filter3) => {
    const activeFilters = [filter1, filter2, filter3].filter((f) => f.length);
    activeFilters.forEach((filter, index) => {
      if (filter.length && activeFilters[index + 1]?.length) {
        filter[filter.length - 1].operator = 'AND';
      } else if (filter.length && !activeFilters[index + 1]?.length) {
        filter[filter.length - 1].operator = '';
      }
    });

    return [...filter1, ...filter2, ...filter3];
  };

  const updateQuery = (event: SubmitEvent): void => {
    const data = new FormData(event.target as HTMLFormElement);
    query = String(data.get('query'));
    parameters = toListWorkflowParameters(query);

    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: query,
    });
  };

  const handleParameterChange = debounce(() => {
    const filters = combineFilters(
      statusFilters,
      workflowIdFilter,
      workflowTypeFilter,
    );
    query = toListWorkflowQueryFromAdvancedFilters(filters, sorts);
    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: query,
      allowEmpty: true,
    });
  }, 300);
</script>

<Table class="relative w-full md:table-fixed">
  <TableHeaderRow slot="headers">
    <th class="hidden w-48 md:table-cell"
      ><div class="flex items-center gap-1">
        Status
        <WorkflowStatusDropdownFilter
          bind:statusFilters
          bind:sorts
          onChange={handleParameterChange}
        />
      </div>
    </th>
    <th class="hidden md:table-cell md:w-60 xl:w-auto"
      ><div class="flex items-center gap-1">
        Workflow Id
        <WorkflowIdDropdownFilter
          bind:workflowIdFilter
          bind:sorts
          onChange={handleParameterChange}
        />
      </div>
    </th>
    <th class="hidden md:table-cell md:w-60 xl:w-80">
      <div class="flex items-center gap-1">
        Type
        <WorkflowTypeDropdownFilter
          bind:workflowTypeFilter
          bind:sorts
          onChange={handleParameterChange}
        />
      </div>
    </th>
    <th class="hidden xl:table-cell xl:w-60">Start</th>
    <th class="hidden xl:table-cell xl:w-60">End</th>
    <th class="table-cell md:hidden" colspan="3">Summary</th>
  </TableHeaderRow>
  {#if updating}
    <div class="updating" />
  {/if}
  <slot />
</Table>

<style lang="postcss">
  .updating {
    @apply absolute top-6 h-4 w-full border-b-4 border-blue-500;
  }
</style>
