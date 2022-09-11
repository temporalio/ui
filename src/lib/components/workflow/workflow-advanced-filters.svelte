<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { page } from '$app/stores';

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

  let filters = [
    { filterType: 'workflowType', value: '', operator: '', parenthesis: '' },
  ];
  let orderType = 'desc';

  $: {
    query = toListWorkflowQueryFromAdvancedFilters(filters);
  }

  const onAddFilterOperator = (operator, index) => {
    if (filters[index].operator === operator) {
      filters[index].operator = '';
    } else {
      filters[index] = { ...filters[index], operator };
      if (!filters[index + 1]) {
        filters = [
          ...filters,
          {
            filterType: 'workflowType',
            value: '',
            operator: '',
            parenthesis: '',
          },
        ];
      }
    }
  };

  const onAddFilterParenthesis = (parenthesis, index) => {
    if (filters[index].parenthesis === parenthesis) {
      filters[index].parenthesis = '';
    } else {
      filters[index] = { ...filters[index], parenthesis };
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

<div
  class="fixed bottom-0 left-0 p-4 bg-gray-100 w-full h-10 z-50 overflow-auto"
>
  <pre class="h-full flex items-center text-lg">{query}</pre>
</div>
<section class="flex flex-col gap-2">
  {#each filters as { filterType, value, operator, parenthesis }, index (index)}
    <div class="flex justify-between gap-16" animate:flip in:fade>
      <AdvancedFilter
        bind:filterType
        bind:value
        bind:operator
        bind:parenthesis
        isOnly={index === 0 && filters.length === 1}
        isLast={index === filters.length - 1}
        setFilterOperator={(operator) => onAddFilterOperator(operator, index)}
        setFilterParenthesis={(parenthesis) =>
          onAddFilterParenthesis(parenthesis, index)}
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
