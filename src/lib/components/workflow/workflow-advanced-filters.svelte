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

  let filters = [{ filterType: 'workflowType', value: '', operator: '' }];
  let orderType = 'desc';

  $: {
    query = toListWorkflowQueryFromAdvancedFilters(filters);
  }

  const onAddFilter = (operator, index) => {
    if (filters[index].operator === operator) {
      filters[index].operator = '';
    } else {
      filters[index] = { ...filters[index], operator };
      if (!filters[index + 1]) {
        filters = [
          ...filters,
          { filterType: 'workflowType', value: '', operator: '' },
        ];
      }
    }
  };

  const onSearch = () => {
    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: query,
      allowEmpty: true,
    });
  };
</script>

<div class="fixed top-0 left-0 pl-20 bg-gray-100 w-full h-6 z-50">
  <p class="h-6 flex items-center text-sm">{query}</p>
</div>
<section class="flex flex-col gap-2">
  {#each filters as { filterType, value, operator }, index}
    <div class="flex justify-between gap-16">
      <AdvancedFilter
        bind:filterType
        bind:value
        bind:operator
        isOnly={index === 0 && filters.length === 1}
        isLast={index === filters.length - 1}
        addFilter={(operator) => onAddFilter(operator, index)}
        removeFilter={() => {
          filters = filters.filter((_, i) => i !== index);
        }}
      />
    </div>
  {/each}
</section>
<div class="flex gap-4 items-center">
  <!-- <AdvancedOrder bind:orderType /> -->
  <Button icon="search" thin variant="primary" on:click={onSearch}
    >Search</Button
  >
  <Button icon="bookmark" thin variant="primary" on:click={onSearch}
    >Save</Button
  >
</div>
