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
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import type { SearchAttributeOption } from '$lib/stores/search-attributes';
  import type { SearchAttributeType } from '$lib/types/workflows';
  import {
    getFocusedElementId,
    isListFilter,
  } from '$lib/utilities/query/search-attribute-filter';
  import { emptyFilter } from '$lib/utilities/query/to-list-workflow-filters';

  import { FILTER_CONTEXT, type FilterContext } from './index.svelte';

  export let filters: SearchAttributeFilter[];
  export let options: SearchAttributeOption[];

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
    filter.set({ ...emptyFilter(), attribute: value, conditional: '=', type });
    $focusedElementId = getFocusedElementId({ attribute: value, type });
  }

  let searchAttributeValue = '';
  //  TODO: Add KeywordList support
  $: _options = options.filter(
    ({ value, type }) => !isListFilter({ attribute: value, type }),
  );

  $: filteredOptions = !searchAttributeValue
    ? _options
    : _options.filter((option) =>
        option.value.toLowerCase().includes(searchAttributeValue.toLowerCase()),
      );
</script>

<MenuContainer>
  <MenuButton
    controls="search-attribute-menu"
    disabled={$activeQueryIndex !== null}
    count={$filter.attribute ? 0 : filters.length}
    on:click={() => (searchAttributeValue = '')}
    class="text-nowrap {!!$filter.attribute && 'attribute-selected'}"
  >
    <svelte:fragment slot="leading">
      {#if !$filter.attribute}
        <Icon name="filter" />
      {/if}
    </svelte:fragment>
    {$filter.attribute || translate('workflows.filter')}
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
