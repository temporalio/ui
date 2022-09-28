<script lang="ts">
  import { fade } from 'svelte/transition';
  import { slide } from 'svelte/transition';
  import { page } from '$app/stores';

  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import { toListWorkflowQueryFromAdvancedFilters } from '$lib/utilities/query/list-workflow-query';

  import { searches } from '$lib/stores/searches';
  import TypeaheadInput from '$lib/holocene/input/typeahead-input.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { searchAttributes } from '$lib/stores/search-attributes';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import CustomSplitButton from '$lib/holocene/custom-split-button.svelte';
  import Input from '$lib/holocene/input/input.svelte';

  let manualSearch = false;
  let manualSearchString = '';

  $: query = $page.url.searchParams.get('query');

  $: filterTypeOptions = $searchAttributes
    ? Object.entries($searchAttributes).map(([key, value]) => {
        return {
          label: key,
          value: key,
          type: value,
        };
      })
    : [];

  export let onFilterChange: (filter: {
    label: string;
    value: string;
    type: SearchAttributesValue;
  }) => void;
  export let filters = [];
  export let sorts = [];

  $: {
    query = toListWorkflowQueryFromAdvancedFilters(filters, sorts);
  }

  const onSearch = () => {
    updateQueryParameters({
      url: $page.url,
      parameter: 'query',
      value: query,
      allowEmpty: true,
    });
  };

  $: bookmarkOptions = (
    [...$searches]?.map((s) => ({ label: s.name, value: s.name })) ?? []
  ).sort((a, b) => a?.label.localeCompare(b.label));

  const onBookmarkChange = (name: string) => {
    const bookmarkedSearch = $searches.find((s) => s.name === name);
    if (bookmarkedSearch) {
      filters = [...bookmarkedSearch.filters];
      sorts = [...(bookmarkedSearch?.sorts ?? [])];
      setTimeout(() => {
        onSearch();
      }, 150);
    }
  };
</script>

{#if !filters.length}
  <div class="mb-4 flex items-center gap-4">
    <div class="flex h-12 w-full items-center gap-0" in:fade>
      {#if manualSearch}
        <Input
          id="manual-search"
          placeholder="Enter or paste"
          icon="search"
          class="w-[600px]"
          unroundRight
          bind:value={manualSearchString}
        />
      {:else}
        <TypeaheadInput
          icon="search"
          placeholder="Filter workflows"
          class="w-80"
          id="filter-type-name"
          options={filterTypeOptions}
          onChange={(filterType) =>
            onFilterChange(
              filterTypeOptions.find((o) => o.value === filterType),
            )}
        />
      {/if}
      <CustomSplitButton
        class="rounded-tr rounded-br bg-offWhite"
        buttonClass="border border-gray-900"
        id="saved"
        icon="star-empty"
      >
        <button
          slot="middle-button"
          class="w-12 rounded-none border border-r-0 border-l-0 border-gray-900 pl-3 text-center"
          class:bg-gray-900={manualSearch}
          class:text-white={manualSearch}
          on:click={() => (manualSearch = !manualSearch)}
        >
          <Icon name="terminal" />
        </button>
        {#each bookmarkOptions as { label, value } (value)}
          <MenuItem on:click={() => onBookmarkChange(value)}>{label}</MenuItem>
        {/each}
      </CustomSplitButton>
    </div>
  </div>
{/if}
