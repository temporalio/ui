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
  import { activityFilters } from '$lib/stores/filters';
  import { activitySearchAttributeOptions } from '$lib/stores/search-attributes';
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

  import {
    ACTIVITY_FILTER_CONTEXT,
    type ActivityFilterContext,
  } from './filter.svelte';

  const query = $derived(page.url.searchParams.get('query') ?? '');
  let searchAttributeValue = $state('');

  const { filter, activeQueryIndex, handleSubmit } =
    getContext<ActivityFilterContext>(ACTIVITY_FILTER_CONTEXT);

  const open = writable(false);

  const getDefaultConditional = (type: SearchAttributeType) => {
    switch (type) {
      case SEARCH_ATTRIBUTE_TYPE.BOOL:
        return '=';
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
      ? $activitySearchAttributeOptions
      : $activitySearchAttributeOptions.filter((option) =>
          option.value
            .toLowerCase()
            .includes(searchAttributeValue.toLowerCase()),
        ),
  );

  function clearAllFilters() {
    $activityFilters = [];
    updateQueryParamsFromFilter(page.url, $activityFilters, true);
    $activeQueryIndex = null;
    $filter = emptyFilter();
  }
</script>

<MenuContainer {open}>
  <MenuButton
    id="activity-search-attribute-filter-button"
    controls="activity-search-attribute-menu"
    leadingIcon="add"
    variant="secondary"
    data-testid="add-filter-button"
    disabled={$activeQueryIndex !== null || query.length >= MAX_QUERY_LENGTH}
    onclick={() => (searchAttributeValue = '')}
    class="text-nowrap"
    size="xs"
  >
    Add Filter
  </MenuButton>
  <Menu id="activity-search-attribute-menu">
    <MenuItem
      class="p-0"
      hoverable={false}
      onclick={() => {
        document.getElementById('activity-filter-search')?.focus();
      }}
    >
      <Input
        label={translate('common.search')}
        labelHidden
        id="activity-filter-search"
        noBorder
        bind:value={searchAttributeValue}
        icon="search"
        placeholder={translate('common.search')}
        class="w-full min-w-[300px]"
      />
    </MenuItem>
    <hr class="border-subtle" />

    {#each filteredOptions as { value, label, type } (value)}
      <MenuItem
        onclick={() => {
          handleNewQuery(value, type);
        }}
        disabled={value === 'ExecutionStatus' &&
          !!$activityFilters.find((f) => isStatusFilter(f))}
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
{#if $activityFilters.length > 0}
  <Button
    variant="ghost"
    size="xs"
    on:click={clearAllFilters}
    data-testid="clear-all-filters-button"
  >
    {translate('common.clear-all')}
  </Button>
{/if}
