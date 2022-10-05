<script lang="ts">
  import { fade } from 'svelte/transition';
  import { slide } from 'svelte/transition';
  import { page } from '$app/stores';

  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { toListWorkflowAdvancedParameters } from '$lib/utilities/query/to-list-workflow-advanced-parameters';
  import {
    toListWorkflowQuery,
    toListWorkflowQueryFromAdvancedFilters,
  } from '$lib/utilities/query/list-workflow-query';

  import AdvancedFilter from './advanced-filter/index.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import SortFilter from './advanced-filter/sort-filter.svelte';
  import CustomButton from '$lib/holocene/custom-button.svelte';
  import AddFilter from './advanced-filter/add-filter.svelte';
  import type { WorkflowFilter } from '$lib/models/workflow-filters';

  export let filters: WorkflowFilter[] = [];
  export let sorts = [];
  export let advancedSearch = false;
  export let manualSearch = false;

  const defaultQuery = toListWorkflowQuery({ timeRange: 'All' });
  $: query = $page.url.searchParams.get('query');
  $: parameters = toListWorkflowAdvancedParameters(query ?? defaultQuery);

  $: {
    console.log('params: ', parameters);
  }

  let showFilters = true;
  let showQuery = true;

  $: {
    // query = toListWorkflowQueryFromAdvancedFilters(filters, sorts);
  }

  const onSearch = () => {
    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: query,
      allowEmpty: true,
    });
  };

  const onRestart = () => {
    filters = [];
    sorts = [];
    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: defaultQuery,
      allowEmpty: true,
    });
  };

  const onRemoveFilter = (index: number) => {
    filters = filters.filter((_, i) => i !== index);
    const lastFilter = filters[filters.length - 1];
    filters[filters.length - 1] = { ...lastFilter, operator: '' };
  };

  const { copy, copied } = copyToClipboard(500);
</script>

<div class="flex flex-col scaleY-.4">
  <div
    class="rounded-tr-lg rounded-tl-lg border border-gray-900 bg-offWhite p-6"
  >
    <h3 class="mb-2 flex items-center gap-2 text-base">Advanced Visibility</h3>
    {#if showFilters}
      <section class="advanced-filters flex flex-col">
        {#each filters as { attribute, value, conditional }, index (index)}
          <div class="flex justify-between my-1 gap-16" transition:slide|local>
            <AdvancedFilter
              bind:attribute
              bind:value
              bind:conditional
              removeFilter={() => onRemoveFilter(index)}
            />
          </div>
        {/each}
        <div class="my-1">
          <AddFilter bind:filters />
        </div>
        <div class="my-1">
          <SortFilter bind:sorts />
        </div>
      </section>
    {/if}
    <div class="mt-8 flex w-full items-center justify-between gap-4">
      <div class="flex items-center gap-2" in:fade>
        <Button variant="primary" icon="search" primary on:click={onSearch}
          >Search</Button
        >
        <CustomButton icon="retry" on:click={onRestart}>Reset</CustomButton>
        <CustomButton
          icon="terminal"
          on:click={() => {
            advancedSearch = false;
            manualSearch = true;
          }}>Manual</CustomButton
        >
      </div>
      <div class="flex items-center gap-2">
        <CustomButton
          icon={showQuery ? 'eye-hide' : 'eye-show'}
          on:click={() => (showQuery = !showQuery)}
        />
        <CustomButton
          icon={showFilters ? 'chevron-up' : 'chevron-down'}
          on:click={() => (showFilters = !showFilters)}
        />
      </div>
    </div>
  </div>
  {#if showQuery}
    <div
      class="flex h-10 w-full items-center overflow-x-auto rounded-br-lg rounded-bl-lg bg-gray-900 p-1 text-white"
      in:fade
    >
      <button on:click={(e) => copy(e, query)} class="mx-1">
        <Icon name={$copied ? 'checkmark' : 'copy'} class="mx-1 text-white" />
      </button>
      <pre class="flex h-full items-center text-sm">{query}</pre>
    </div>
  {/if}
</div>
