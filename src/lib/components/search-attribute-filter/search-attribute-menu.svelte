<script lang="ts">
  import { getContext } from 'svelte';

  import { page } from '$app/stores';

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
  import { hideChildWorkflows, searchInputViewOpen } from '$lib/stores/filters';
  import type { SearchAttributeOption } from '$lib/stores/search-attributes';
  import {
    SEARCH_ATTRIBUTE_TYPE,
    type SearchAttributeType,
  } from '$lib/types/workflows';
  import { workflowRoutePattern } from '$lib/utilities/namespace-url-pattern';
  import { getFocusedElementId } from '$lib/utilities/query/search-attribute-filter';
  import { emptyFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { MAX_QUERY_LENGTH } from '$lib/utilities/request-from-api';

  import IsTemporalServerVersionGuard from '../is-temporal-server-version-guard.svelte';

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
    disabled={$activeQueryIndex !== null || query?.length >= MAX_QUERY_LENGTH}
    count={showOptions ? ($filter.attribute ? 0 : filters.length) : 0}
    on:click={() => (searchAttributeValue = '')}
    class="text-nowrap"
  >
    <svelte:fragment slot="leading">
      {#if !$filter.attribute}
        <Icon name="add" />
      {/if}
    </svelte:fragment>
    {$filter.attribute || 'Search Attribute'}
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
    {#if showOptions}
      <MenuItem
        class="min-w-56"
        data-testid="manual-search-toggle"
        on:click={() => ($searchInputViewOpen = !$searchInputViewOpen)}
        description={translate('workflows.view-search-description')}
        >{translate('workflows.view-search-input')}</MenuItem
      >
      <IsTemporalServerVersionGuard minimumVersion="1.23.0">
        <MenuItem
          on:click={() => ($hideChildWorkflows = !$hideChildWorkflows)}
          description={$hideChildWorkflows
            ? 'Child Workflows hidden by default when no filter applied'
            : ''}
        >
          <div class="flex items-center gap-1">
            {#if $hideChildWorkflows}
              <Icon name="eye-hide" />{translate('workflows.hide-children')}
            {:else}
              <Icon name="eye-show" />{translate('workflows.show-children')}
            {/if}
          </div>
        </MenuItem>
      </IsTemporalServerVersionGuard>
    {/if}
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
