<script lang="ts">
  import { page } from '$app/stores';

  import { timeFormat } from '$lib/stores/time-format';

  import { durations } from '$lib/utilities/to-duration';
  import { toListWorkflowParameters } from '$lib/utilities/query/to-list-workflow-parameters';
  import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';

  import Select from '$lib/components/select/select.svelte';
  import Option from '$lib/components/select/option.svelte';
  import Input from '$lib/components/input.svelte';
  import Search from '$lib/components/search.svelte';
  import { goto } from '$app/navigation';

  export let searchType: 'basic' | 'advanced';
  export let query: string;
  export let update: (query: string) => void;

  let parameters = toListWorkflowParameters(query);

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
      $page.url.searchParams.set('search', searchType);
      goto($page.url.search, {
        replaceState: true,
        keepfocus: true,
        noscroll: true,
      });
    };

  const updateQuery = (event: SubmitEvent): void => {
    const data = new FormData(event.target as HTMLFormElement);
    query = String(data.get('query'));
    parameters = toListWorkflowParameters(query);
    update(query);
  };

  const handleParameterChange = () => {
    query = toListWorkflowQuery(parameters);
    update(query);
  };
</script>

<section class="flex flex-col gap-2">
  <p class="text-right text-xs">
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
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
      <Input
        id="workflow-id-filter"
        label="Workflow ID"
        bind:value={parameters.workflowId}
        on:input={handleParameterChange}
      />
      <Input
        id="workflow-type-filter"
        label="Workflow ID"
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
      <Select id="filter-by-relative-time" bind:value={$timeFormat}>
        <Option value={'relative'}>Relative</Option>
        <Option value={'UTC'}>UTC</Option>
        <Option value={'local'}>Local</Option>
      </Select>
    </div>
  {/if}
</section>
