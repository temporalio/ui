<script lang="ts">
  import { getContext } from 'svelte';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import {
    Menu,
    MenuButton,
    MenuContainer,
    MenuItem,
  } from '$lib/holocene/menu';
  import { translate } from '$lib/i18n/translate';
  import type { WorkflowFilter } from '$lib/models/workflow-filters';
  import { workflowFilters } from '$lib/stores/filters';
  import { sortedSearchAttributeOptions } from '$lib/stores/search-attributes';
  import {
    isBooleanFilter,
    isDateTimeFilter,
    isListFilter,
    isNumberFilter,
    isStatusFilter,
    isTextFilter,
  } from '$lib/utilities/query/filter-search';
  import { emptyFilter } from '$lib/utilities/query/to-list-workflow-filters';

  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  const { filter, activeQueryIndex, focusedElementId } =
    getContext<FilterContext>(FILTER_CONTEXT);

  function getFocusedElementId(attribute: string) {
    if (isStatusFilter(attribute)) return 'status-filter';

    if (isTextFilter(attribute)) return 'text-filter-search';

    if (isListFilter(attribute)) return 'list-filter-search';

    if (isNumberFilter(attribute) || isDateTimeFilter(attribute))
      return 'conditional-menu-button';

    if (isBooleanFilter(attribute)) return 'boolean-filter';

    return '';
  }

  function isOptionDisabled(value: string, filters: WorkflowFilter[]) {
    return filters.some(
      (filter) =>
        (filter.conditional === '=' || filter.conditional === '!=') &&
        filter.attribute === value,
    );
  }

  function handleNewQuery(value: string) {
    searchAttributeValue = '';
    filter.set({ ...emptyFilter(), attribute: value, conditional: '=' });
    $focusedElementId = getFocusedElementId(value);
  }

  let searchAttributeValue = '';
  //  TODO: Add KeywordList support
  $: options = $sortedSearchAttributeOptions.filter(
    (option) => !isListFilter(option.value),
  );

  $: filteredOptions = !searchAttributeValue
    ? options
    : options.filter((option) =>
        option.value.toLowerCase().includes(searchAttributeValue.toLowerCase()),
      );
</script>

<MenuContainer>
  <MenuButton
    controls="search-attribute-menu"
    unroundRight={Boolean($filter.attribute)}
    disabled={$activeQueryIndex !== null}
    count={$filter.attribute ? 0 : $workflowFilters.length}
    on:click={() => (searchAttributeValue = '')}
  >
    <svelte:fragment slot="leading">
      {#if !$filter.attribute}
        <Icon name="filter" />
      {/if}
    </svelte:fragment>
    {$filter.attribute || translate('workflows', 'filter')}
  </MenuButton>
  <Menu id="search-attribute-menu">
    <Input
      label={translate('search')}
      labelHidden
      id="filter-search"
      noBorder
      bind:value={searchAttributeValue}
      icon="search"
      placeholder={translate('search')}
      class="mb-1"
    />

    {#each filteredOptions as { value, label }}
      {@const disabled = isOptionDisabled(value, $workflowFilters)}
      <MenuItem
        on:click={() => {
          handleNewQuery(value);
        }}
        {disabled}
      >
        {label}
      </MenuItem>
    {:else}
      <MenuItem class="whitespace-nowrap" disabled
        >{translate('no-results')}</MenuItem
      >
    {/each}
  </Menu>
</MenuContainer>
