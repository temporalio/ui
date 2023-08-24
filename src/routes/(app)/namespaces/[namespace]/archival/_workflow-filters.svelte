<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { durations } from '$lib/utilities/to-duration';

  import Select from '$lib/holocene/select/simple-select.svelte';
  import Option from '$lib/holocene/select/simple-option.svelte';
  import FilterSelect from '$lib/holocene/select/filter-select.svelte';
  import FilterInput from './_filter-input.svelte';
  import Search from '$lib/components/search.svelte';

  import { timeFormat } from '$lib/stores/time-format';
  import { translate } from '$lib/i18n/translate';
  import Link from '$lib/holocene/icon/svg/link.svelte';

  const statuses = {
    All: { value: null, label: translate('workflows', 'all-statuses') },
    'Timed Out': {
      value: 'TimedOut',
      label: translate('workflows', 'timed-out'),
    },
    Completed: {
      value: 'Completed',
      label: translate('workflows', 'completed'),
    },
    Failed: { value: 'Failed', label: translate('workflows', 'failed') },
    'Continued as New': {
      value: 'ContinuedAsNew',
      label: translate('workflows', 'continued-as-new'),
    },
    Canceled: {
      value: 'Canceled',
      label: translate('workflows', 'canceled'),
    },
    Terminated: {
      value: 'Terminated',
      label: translate('workflows', 'terminated'),
    },
  };

  let isAdvancedQuery = $page.url.searchParams.has('query');
  let workflowIdFilter = '';
  let workflowTypeFilter = '';

  const submitAdvancedQuery = (event: SubmitEvent): void => {
    const data = new FormData(event.target as HTMLFormElement);
    const query = data.get('query');
    $page.url.searchParams.set('query', String(query));
    goto($page.url.toString());
  };

  const handleToggle =
    (searchType: 'basic' | 'advanced') =>
    (event: Event): void => {
      const element = event.target as HTMLAnchorElement;
      isAdvancedQuery = searchType === 'advanced';

      if (!isAdvancedQuery) {
        $page.url.searchParams.delete('query');
      }

      goto(element.href);
    };
</script>

<section class="flex flex-col gap-2">
  <p class="text-right text-xs">
    {#if isAdvancedQuery}
      <Link href={$page.url.pathname} on:click={handleToggle('basic')}>
        {translate('workflows', 'basic-search')}
      </Link>
    {:else}
      <Link class="text-blue-700" on:click={handleToggle('advanced')}>
        {translate('workflows', 'advanced-search')}
      </Link>
    {/if}
  </p>

  {#if !isAdvancedQuery}
    <Search
      icon
      placeholder={translate('search')}
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
        name={translate('workflow-id')}
        value={workflowIdFilter}
      />
      <FilterInput
        parameter="workflow-type"
        name={translate('workflow-type')}
        value={workflowTypeFilter}
      />
      <FilterSelect
        label={translate('workflows', 'time-range')}
        parameter="time-range"
        value="24 hours"
      >
        {#each durations as value}
          <Option {value}>{value}</Option>
        {/each}
      </FilterSelect>
      <FilterSelect label={translate('status')} parameter="status" value={null}>
        {#each Object.values(statuses) as { value, label } (label)}
          <Option {value}>{label}</Option>
        {/each}
      </FilterSelect>
      <Select id="filter-by-relative-time" bind:value={$timeFormat}>
        <Option value={'relative'}>{translate('relative')}</Option>
        <Option value={'UTC'}>{translate('utc')}</Option>
        <Option value={'local'}>{translate('local')}</Option>
      </Select>
    </div>
  {/if}
</section>
