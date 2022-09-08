<script lang="ts">
  import debounce from 'just-debounce';
  import { page } from '$app/stores';

  import { timeFormat } from '$lib/stores/time-format';

  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { toListWorkflowParameters } from '$lib/utilities/query/to-list-workflow-parameters';
  import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';

  import AdvancedFilter from './advanced-filter.svelte';

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

  let filters = [''];
</script>

<section class="flex flex-col gap-2">
  {#each filters as filter, index}
    <AdvancedFilter
      bind:value={filter}
      isOnly={index === 0 && filters.length === 1}
      isLast={index === filters.length - 1}
      addFilter={() => {
        filters = [...filters, ''];
      }}
      removeFilter={() => {
        filters = filters.filter((_, i) => i !== index);
      }}
    />
  {/each}
</section>
