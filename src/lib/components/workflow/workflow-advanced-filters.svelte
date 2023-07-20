<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { page } from '$app/stores';

  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { toListWorkflowQuery } from '$lib/utilities/query/list-workflow-query';

  import AdvancedFilter from './advanced-filter/index.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import CustomButton from '$lib/components/workflow/advanced-filter/custom-button.svelte';
  import AddFilter from './advanced-filter/add-filter.svelte';
  import { workflowFilters } from '$lib/stores/filters';
  import Tooltip from '$lib/holocene/tooltip.svelte';

  export let advancedSearch = false;
  export let manualSearch = false;

  const defaultQuery = toListWorkflowQuery({ timeRange: 'All' });
  $: query = $page.url.searchParams.get('query');

  let showFilters = true;
  let showQuery = true;

  const onRestart = () => {
    $workflowFilters = [];
    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: defaultQuery,
      allowEmpty: true,
    });
    advancedSearch = false;
  };

  const onRemoveFilter = (index: number) => {
    $workflowFilters = $workflowFilters.filter((_, i) => i !== index);
    const lastFilter = $workflowFilters[$workflowFilters.length - 1];
    $workflowFilters[$workflowFilters.length - 1] = {
      ...lastFilter,
      operator: '',
    };
  };

  const { copy, copied } = copyToClipboard(500);
</script>

<div class="flex flex-col">
  <div class="rounded-tr-lg rounded-tl-lg border border-gray-900 bg-white p-6">
    <div class="mb-2 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <Tooltip top text="Back">
          <CustomButton
            icon="chevron-left"
            on:click={() => {
              advancedSearch = false;
            }}
          />
        </Tooltip>
        <h3 class="text-base">Advanced Visibility</h3>
      </div>
      <div class="flex items-center gap-2">
        <Tooltip top text="Reset search">
          <CustomButton icon="retry" on:click={onRestart} />
        </Tooltip>
        <Tooltip top text="Manual search">
          <CustomButton
            icon="terminal"
            on:click={() => {
              advancedSearch = false;
              manualSearch = true;
            }}
          />
        </Tooltip>
        <Tooltip top text={showQuery ? 'Hide query' : 'Show query'}>
          <CustomButton
            icon={showQuery ? 'eye-hide' : 'eye-show'}
            on:click={() => (showQuery = !showQuery)}
          />
        </Tooltip>
        <Tooltip top text={showFilters ? 'Hide filters' : 'Show filters'}>
          <CustomButton
            icon={showFilters ? 'chevron-up' : 'chevron-down'}
            on:click={() => (showFilters = !showFilters)}
          />
        </Tooltip>
      </div>
    </div>
    {#if showFilters}
      <div class="advanced-filters flex flex-col gap-2">
        {#each $workflowFilters as { attribute, value, conditional }, index (index)}
          <div class="my-1" transition:fly|local>
            <AdvancedFilter
              bind:attribute
              bind:value
              bind:conditional
              removeFilter={() => onRemoveFilter(index)}
            />
          </div>
        {/each}
        <div class="my-1">
          <AddFilter />
        </div>
      </div>
    {/if}
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
