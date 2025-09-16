<script lang="ts">
  import { getContext } from 'svelte';

  import { page } from '$app/stores';

  import Input from '$lib/holocene/input/input.svelte';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuItem,
  } from '$lib/holocene/menu';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import type { SearchAttributeOption } from '$lib/stores/search-attributes';
  import {
    SEARCH_ATTRIBUTE_TYPE,
    type SearchAttributeType,
  } from '$lib/types/workflows';
  import { workflowRoutePattern } from '$lib/utilities/namespace-url-pattern';
  import { getFocusedElementId } from '$lib/utilities/query/search-attribute-filter';
  import { emptyFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { MAX_QUERY_LENGTH } from '$lib/utilities/request-from-api';

  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  export let filters: SearchAttributeFilter[];
  export let options: SearchAttributeOption[];
  export let showOptions = workflowRoutePattern.match(
    window?.location?.pathname,
  );

  const { filter, activeQueryIndex, focusedElementId } =
    getContext<FilterContext>(FILTER_CONTEXT);

  function isOptionDisabled(value: string, filters: SearchAttributeFilter[]) {
    return filters.some(
      (filter) =>
        ['=', '!=', 'is', 'is not'].includes(filter.conditional) &&
        filter.attribute === value,
    );
  }

  function handleNewQuery(value: string, type: SearchAttributeType) {
    searchAttributeValue = '';
    const conditional = type === SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST ? 'in' : '=';
    filter.set({ ...emptyFilter(), attribute: value, conditional, type });
    $focusedElementId = getFocusedElementId($filter);
  }

  let searchAttributeValue = '';

  $: filteredOptions = !searchAttributeValue
    ? options
    : options.filter((option) =>
        option.value.toLowerCase().includes(searchAttributeValue.toLowerCase()),
      );

  $: query = $page.url.searchParams.get('query');
</script>

<MenuContainer>
  <MenuButton
    id="search-attribute-filter-button"
    controls="search-attribute-menu"
    leadingIcon="add"
    disabled={$activeQueryIndex !== null || query?.length >= MAX_QUERY_LENGTH}
    count={showOptions ? ($filter.attribute ? 0 : filters.length) : 0}
    on:click={() => (searchAttributeValue = '')}
    class="text-nowrap"
    size="xs"
  >
    Add Filter
  </MenuButton>
  <Menu id="search-attribute-menu" keepOpen>
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
      {@const disabled = isOptionDisabled(value, filters)}
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
