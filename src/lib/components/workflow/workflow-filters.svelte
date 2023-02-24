<script lang="ts">
  import debounce from 'just-debounce';
  import { page } from '$app/stores';

  import { timeFormat } from '$lib/stores/time-format';

  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { durations } from '$lib/utilities/to-duration';
  import { toListWorkflowParameters } from '$lib/utilities/query/to-list-workflow-parameters';
  import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';

  import Select from '$lib/holocene/select/simple-select.svelte';
  import Option from '$lib/holocene/select/simple-option.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Search from '$lib/components/search.svelte';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher<{ search: undefined }>();

  export let searchType: 'basic' | 'advanced';

  const defaultQuery = toListWorkflowQuery({ timeRange: 'All' });
  $: query = $page.url.searchParams.get('query');
  $: parameters = toListWorkflowParameters(query ?? defaultQuery);

  const statuses = {
    All: null,
    Running: 'Running',
    'Timed Out': 'TimedOut',
    Completed: 'Completed',
    Failed: 'Failed',
    'Continued as New': 'ContinuedAsNew',
    Canceled: 'Canceled',
    Terminated: 'Terminated',
  };

  const updateSearchType =
    (newSearchType: 'basic' | 'advanced') => (): void => {
      searchType = newSearchType;

      updateQueryParameters({
        parameter: 'search',
        value: searchType,
        url: $page.url,
      });
    };

  const updateQuery = (event: SubmitEvent): void => {
    dispatch('search');
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
    dispatch('search');
    query = toListWorkflowQuery(parameters);

    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: query,
      allowEmpty: true,
    });
  }, 300);
</script>

<div class="flex flex-col">
  <p class="pb-2 text-right text-xs">
    {#if searchType === 'advanced'}
      <a
        href="{$page.url.pathname}?searchType=basic"
        class="text-blue-700"
        on:click|preventDefault={updateSearchType('basic')}
      >
        Basic Search
      </a>
    {:else}
      <a
        href="{$page.url.pathname}?searchType=advanced"
        class="text-blue-700"
        on:click|preventDefault={updateSearchType('advanced')}
      >
        Advanced Search
      </a>
    {/if}
  </p>

  {#if searchType === 'advanced'}
    <Search
      icon
      id="advanced-search"
      placeholder="Query…"
      value={query}
      on:submit={updateQuery}
    />
  {:else}
    <div
      role="search"
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5"
    >
      <Input
        icon="search"
        type="search"
        id="workflow-id-filter"
        placeholder="Workflow ID"
        bind:value={parameters.workflowId}
        on:input={handleParameterChange}
      />
      <Input
        icon="search"
        type="search"
        id="workflow-type-filter"
        placeholder="Workflow Type"
        bind:value={parameters.workflowType}
        on:input={handleParameterChange}
      />
      <Select
        id="time-range-filter"
        label="Time Range"
        bind:value={parameters.timeRange}
        on:change={handleParameterChange}
      >
        <Option value={null}>All</Option>
        {#if parameters.timeRange && !durations.includes(parameters.timeRange)}
          <Option value={parameters.timeRange}>{parameters.timeRange}</Option>
        {/if}
        {#each durations as value}
          <Option {value}>{value}</Option>
        {/each}
      </Select>
      <Select
        id="execution-status-filter"
        label="Workflow Status"
        bind:value={parameters.executionStatus}
        on:change={handleParameterChange}
      >
        {#each Object.entries(statuses) as [label, value] (label)}
          <Option {value}>{label}</Option>
        {/each}
      </Select>
      <Select
        id="filter-by-relative-time"
        bind:value={$timeFormat}
        label="Time Format"
      >
        <Option value={'relative'}>Relative</Option>
        <Option value={'UTC'}>UTC</Option>
        <Option value={'local'}>Local</Option>
      </Select>
    </div>
  {/if}
</div>
