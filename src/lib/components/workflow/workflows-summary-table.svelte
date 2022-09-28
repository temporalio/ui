<script lang="ts">
  import debounce from 'just-debounce';
  import { page } from '$app/stores';

  import { timeFormat } from '$lib/stores/time-format';

  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { durations } from '$lib/utilities/to-duration';
  import { toListWorkflowParameters } from '$lib/utilities/query/to-list-workflow-parameters';
  import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';

  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import StatusDropdownFilter from './dropdown-filter/status.svelte';

  export let updating = false;

  const defaultQuery = toListWorkflowQuery({ timeRange: 'All' });
  $: query = $page.url.searchParams.get('query');
  $: parameters = toListWorkflowParameters(query ?? defaultQuery);

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
    query = toListWorkflowQuery(parameters);

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
        <StatusDropdownFilter
          bind:value={parameters.executionStatus}
          onChange={handleParameterChange}
        />
      </div>
    </th>
    <th class="hidden md:table-cell md:w-60 xl:w-auto">Workflow Id</th>
    <th class="hidden md:table-cell md:w-60 xl:w-80">Type</th>
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
