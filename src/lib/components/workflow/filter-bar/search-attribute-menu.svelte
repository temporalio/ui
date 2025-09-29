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
  import { isStatusFilter } from '$lib/utilities/query/search-attribute-filter';
  import {
    emptyFilter,
    updateQueryParamsFromFilter,
  } from '$lib/utilities/query/to-list-workflow-filters';
  import { MAX_QUERY_LENGTH } from '$lib/utilities/request-from-api';

  import { FILTER_CONTEXT, type FilterContext } from './filter.svelte';

  let { options }: { options: SearchAttributeOption[] } = $props();

  const query = $derived(page.url.searchParams.get('query'));
  let searchAttributeValue = $state('');

  const { filter, activeQueryIndex, handleSubmit } =
    getContext<FilterContext>(FILTER_CONTEXT);

  const open = writable(false);

  const getDefaultConditional = (type: SearchAttributeType) => {
    switch (type) {
      case SEARCH_ATTRIBUTE_TYPE.BOOL:
        return 'true';
      case SEARCH_ATTRIBUTE_TYPE.DATETIME:
        return '>=';
      case SEARCH_ATTRIBUTE_TYPE.INT:
        return '=';
      case SEARCH_ATTRIBUTE_TYPE.DOUBLE:
        return '=';
      case SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST:
        return 'in';
      case SEARCH_ATTRIBUTE_TYPE.KEYWORD:
        return '=';
      case SEARCH_ATTRIBUTE_TYPE.TEXT:
        return '=';
      default:
        return '=';
    }
  };

  function handleNewQuery(value: string, type: SearchAttributeType) {
    searchAttributeValue = '';
    filter.set({
      ...emptyFilter(),
      attribute: value,
      conditional: getDefaultConditional(type),
      type,
    });
    handleSubmit();
    $open = false;
  }

  const filteredOptions = $derived(
    !searchAttributeValue
      ? options
      : options.filter((option) =>
          option.value
            .toLowerCase()
            .includes(searchAttributeValue.toLowerCase()),
        ),
  );

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
    data-testid="add-filter-button"
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
        class="w-full min-w-[300px]"
      />
    </MenuItem>
    <hr class="border-subtle" />

    {#each filteredOptions as { value, label, type }}
      <MenuItem
        on:click={() => {
          handleNewQuery(value, type);
        }}
        disabled={value === 'ExecutionStatus' &&
          !!$workflowFilters.find((f) => isStatusFilter(f))}
      >
        <div>
          <p class="leading-3">{label}</p>
          <small class="text-secondary">{type}</small>
        </div>
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
