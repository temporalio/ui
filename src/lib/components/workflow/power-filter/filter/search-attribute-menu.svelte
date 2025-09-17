<script lang="ts">
  import { writable } from 'svelte/store';

  import { getContext } from 'svelte';

  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuItem,
  } from '$lib/holocene/menu';
  import { translate } from '$lib/i18n/translate';
  import { workflowFilters } from '$lib/stores/filters';
  import type { SearchAttributeOption } from '$lib/stores/search-attributes';
  import {
    SEARCH_ATTRIBUTE_TYPE,
    type SearchAttributeType,
  } from '$lib/types/workflows';
  import {
    emptyFilter,
    updateQueryParamsFromFilter,
  } from '$lib/utilities/query/to-list-workflow-filters';
  import { MAX_QUERY_LENGTH } from '$lib/utilities/request-from-api';

  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  export let options: SearchAttributeOption[];

  const { filter, activeQueryIndex, handleSubmit } =
    getContext<FilterContext>(FILTER_CONTEXT);

  const open = writable(false);

  function isOptionDisabled(value: string) {
    return $workflowFilters.some(
      (filter) =>
        ['=', '!=', 'is', 'is not'].includes(filter.conditional) &&
        filter.attribute === value,
    );
  }

  function handleNewQuery(value: string, type: SearchAttributeType) {
    searchAttributeValue = '';
    const conditional = type === SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST ? 'in' : '=';
    // Create a new filter, submit to parent to append to list
    const newFilter = { ...emptyFilter(), attribute: value, conditional, type };
    filter.set(newFilter);
    // Parent will push and set chipOpenIndex to new chip
    handleSubmit();
    // Close the attribute menu after selection
    $open = false;
  }

  let searchAttributeValue = '';

  $: filteredOptions = !searchAttributeValue
    ? options
    : options.filter((option) =>
        option.value.toLowerCase().includes(searchAttributeValue.toLowerCase()),
      );

  $: query = page.url.searchParams.get('query');

  function clearAllFilters() {
    $workflowFilters = [];
    updateQueryParamsFromFilter(page.url, $workflowFilters, true);
    $activeQueryIndex = null;
    $filter = emptyFilter();
  }
</script>

<MenuContainer {open}>
  <MenuButton
    id="search-attribute-filter-button"
    controls="search-attribute-menu"
    leadingIcon="add"
    variant="secondary"
    disabled={$activeQueryIndex !== null || query?.length >= MAX_QUERY_LENGTH}
    on:click={() => (searchAttributeValue = '')}
    class="text-nowrap"
    size="xs"
  >
    Add Filter
  </MenuButton>
  <Menu id="search-attribute-menu">
    <MenuItem
      class="p-0"
      hoverable={false}
      on:click={() => {
        document.getElementById('filter-search')?.focus();
      }}
    >
      <Input
        label={translate('common.search')}
        labelHidden
        id="filter-search"
        noBorder
        bind:value={searchAttributeValue}
        icon="search"
        placeholder={translate('common.search')}
        class="w-full"
      />
    </MenuItem>
    <hr class="border-subtle" />

    {#each filteredOptions as { value, label, type }}
      {@const disabled = isOptionDisabled(value)}
      <MenuItem
        on:click={() => {
          handleNewQuery(value, type);
        }}
        {disabled}
      >
        {label}
      </MenuItem>
    {:else}
      <MenuItem class="whitespace-nowrap" disabled
        >{translate('common.no-results')}</MenuItem
      >
    {/each}
  </Menu>
</MenuContainer>
{#if $workflowFilters.length > 0}
  <Button variant="ghost" size="xs" on:click={clearAllFilters}>
    {translate('common.clear-all')}
  </Button>
{/if}
