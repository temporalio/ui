<script lang="ts">
  import { fade } from 'svelte/transition';
  import { fly } from 'svelte/transition';
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
  import CustomButton from '$lib/holocene/custom-button.svelte';
  import Button from '$lib/holocene/button.svelte';

  let manualSearch = true;
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
        <div in:fly={{ x: 200, duration: 300 }}>
          <Input
            id="manual-search"
            placeholder="Enter or paste a query..."
            icon="search"
            class="w-[600px]"
            unroundRight
            autoFocus
            bind:value={manualSearchString}
          />
        </div>
      {:else}
        <div in:fly={{ x: 200, duration: 300 }}>
          <TypeaheadInput
            icon="search"
            placeholder="Filter workflows"
            class="w-80"
            id="filter-type-name"
            autoFocus
            options={filterTypeOptions}
            onChange={(filterType) =>
              onFilterChange(
                filterTypeOptions.find((o) => o.value === filterType),
              )}
          />
        </div>
      {/if}
      <Button
        variant="primary"
        class="h-10"
        unroundLeft
        on:click={() => (manualSearch = !manualSearch)}
      >
        Search
      </Button>
    </div>
  </div>
{/if}
