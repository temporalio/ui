<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import Search from '$lib/components/search.svelte';
  import Link from '$lib/holocene/link.svelte';
  import FilterSelect from '$lib/holocene/select/filter-select.svelte';
  import Option from '$lib/holocene/select/simple-option.svelte';
  import Select from '$lib/holocene/select/simple-select.svelte';
  import { translate } from '$lib/i18n/translate';
  import { timeFormat } from '$lib/stores/time-format';
  import { durations } from '$lib/utilities/to-duration';

  import FilterInput from './_filter-input.svelte';

  const statuses = {
    All: { value: null, label: translate('workflows.all-statuses') },
    'Timed Out': {
      value: 'TimedOut',
      label: translate('workflows.timed-out'),
    },
    Completed: {
      value: 'Completed',
      label: translate('workflows.completed'),
    },
    Failed: { value: 'Failed', label: translate('workflows.failed') },
    'Continued as New': {
      value: 'ContinuedAsNew',
      label: translate('workflows.continued-as-new'),
    },
    Canceled: {
      value: 'Canceled',
      label: translate('workflows.canceled'),
    },
    Terminated: {
      value: 'Terminated',
      label: translate('workflows.terminated'),
    },
  };

  $: isAdvancedQuery = $page.url.searchParams.has('query');
  let workflowIdFilter = '';
  let workflowTypeFilter = '';

  const submitAdvancedQuery = (event: SubmitEvent): void => {
    const data = new FormData(event.target as HTMLFormElement);
    const query = data.get('query');
    $page.url.searchParams.set('query', String(query));
    goto($page.url.toString());
  };
</script>

<section class="flex flex-col gap-2">
  <p class="text-right text-xs">
    {#if isAdvancedQuery}
      <Link href={$page.url.pathname}>
        {translate('workflows.basic-search')}
      </Link>
    {:else}
      <Link href={`${$page.url.pathname}?query=`}>
        {translate('workflows.advanced-search')}
      </Link>
    {/if}
  </p>

  {#if isAdvancedQuery}
    <Search
      icon
      placeholder={translate('common.search')}
      value={$page.url.searchParams.get('query')}
      on:submit={submitAdvancedQuery}
    />
  {:else}
    <div
      class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5"
      role="search"
    >
      <FilterInput
        parameter="workflow-id"
        name={translate('common.workflow-id')}
        value={workflowIdFilter}
      />
      <FilterInput
        parameter="workflow-type"
        name={translate('common.workflow-type')}
        value={workflowTypeFilter}
      />
      <FilterSelect
        label={translate('workflows.time-range')}
        parameter="time-range"
        value="24 hours"
      >
        {#each durations as value}
          <Option {value}>{value}</Option>
        {/each}
      </FilterSelect>
      <FilterSelect
        label={translate('common.status')}
        parameter="status"
        value={null}
      >
        {#each Object.values(statuses) as { value, label } (label)}
          <Option {value}>{label}</Option>
        {/each}
      </FilterSelect>
      <Select
        id="filter-by-relative-time"
        label={translate('common.time')}
        bind:value={$timeFormat}
      >
        <Option value={'relative'}>{translate('common.relative')}</Option>
        <Option value={'UTC'}>{translate('common.utc')}</Option>
        <Option value={'local'}>{translate('common.local')}</Option>
      </Select>
    </div>
  {/if}
</section>
