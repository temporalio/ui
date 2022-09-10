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

  import AdvancedFilter from './advanced-filter/index.svelte';
  import AdvancedOrder from './advanced-filter/order.svelte';
  import Button from '$lib/holocene/button.svelte';

  const defaultQuery = toListWorkflowQuery({ timeRange: 'All' });
  $: query = $page.url.searchParams.get('query');
  $: parameters = toListWorkflowParameters(query ?? defaultQuery);

  const updateQuery = (event: SubmitEvent): void => {
    const data = new FormData(event.target as HTMLFormElement);
    const defaultQuery = toListWorkflowQuery({ timeRange: 'All' });

    query = String(data.get('query'));
    parameters = toListWorkflowParameters(query);

    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: query,
    });
  };

  let filters = [{ filterType: 'workflowType', value: '' }];
  let orderType = 'desc';

  const onSearch = () => {
    query = toListWorkflowQueryFromAdvancedFilters(filters);

    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: query,
      allowEmpty: true,
    });
  };
</script>

<section class="flex flex-col gap-2 w-96">
  {#each filters as { filterType, value }, index}
    <div class="flex justify-between gap-16">
      <AdvancedFilter
        bind:filterType
        bind:value
        isOnly={index === 0 && filters.length === 1}
        isLast={index === filters.length - 1}
        addFilter={() => {
          filters = [...filters, { filterType: 'workflowType', value: '' }];
        }}
        removeFilter={() => {
          filters = filters.filter((_, i) => i !== index);
        }}
      />
    </div>
  {/each}
</section>
<div class="flex gap-4 items-center">
  <div class="bg-gray-100"><pre>{query}</pre></div>
  <AdvancedOrder bind:orderType />
  <Button icon="search" thin variant="primary" on:click={onSearch}
    >Search</Button
  >
</div>
