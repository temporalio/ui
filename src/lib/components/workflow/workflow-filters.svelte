<script lang="ts">
  import debounce from 'just-debounce';
  import { createEventDispatcher } from 'svelte';

  import { page } from '$app/stores';

  import Search from '$lib/components/search.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import Link from '$lib/holocene/link.svelte';
  import Option from '$lib/holocene/select/simple-option.svelte';
  import Select from '$lib/holocene/select/simple-select.svelte';
  import { translate } from '$lib/i18n/translate';
  import { timeFormat } from '$lib/stores/time-format';
  import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';
  import { toListWorkflowParameters } from '$lib/utilities/query/to-list-workflow-parameters';
  import { BASE_TIME_FORMAT_OPTIONS } from '$lib/utilities/timezone';
  import { durations } from '$lib/utilities/to-duration';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

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
      <Link
        href="{$page.url.pathname}?search=basic"
        on:click={updateSearchType('basic')}
      >
        {translate('workflows.basic-search')}
      </Link>
    {:else}
      <Link
        href="{$page.url.pathname}?search=advanced"
        on:click={updateSearchType('advanced')}
      >
        {translate('workflows.advanced-search')}
      </Link>
    {/if}
  </p>

  {#if searchType === 'advanced'}
    <Search
      icon
      id="advanced-search"
      placeholder={translate('common.query')}
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
        placeholder={translate('common.workflow-id')}
        label={translate('common.workflow-id')}
        labelHidden
        bind:value={parameters.workflowId}
        on:input={handleParameterChange}
      />
      <Input
        icon="search"
        type="search"
        id="workflow-type-filter"
        placeholder={translate('common.workflow-type')}
        label={translate('common.workflow-type')}
        labelHidden
        bind:value={parameters.workflowType}
        on:input={handleParameterChange}
      />
      <Select
        id="time-range-filter"
        label={translate('common.time-range')}
        bind:value={parameters.timeRange}
        onchange={handleParameterChange}
      >
        <Option value={null}>All</Option>
        {#if parameters.timeRange && !durations.includes(parameters.timeRange)}
          <Option value={parameters.timeRange}>{parameters.timeRange}</Option>
        {/if}
        {#each durations as value (value)}
          <Option {value}>{value}</Option>
        {/each}
      </Select>
      <Select
        id="execution-status-filter"
        label={translate('common.status')}
        bind:value={parameters.executionStatus}
        onchange={handleParameterChange}
      >
        {#each Object.entries(statuses) as [label, value] (label)}
          <Option {value}>{label}</Option>
        {/each}
      </Select>
      <Select
        id="filter-by-relative-time"
        bind:value={$timeFormat}
        label={translate('common.time-format')}
      >
        <Option value="relative">{translate('common.relative')}</Option>
        <Option value={BASE_TIME_FORMAT_OPTIONS.UTC}
          >{translate('common.utc')}</Option
        >
        <Option value={BASE_TIME_FORMAT_OPTIONS.LOCAL}
          >{translate('common.local')}</Option
        >
      </Select>
    </div>
  {/if}
</div>
