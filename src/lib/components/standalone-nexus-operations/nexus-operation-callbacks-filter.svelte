<script lang="ts">
  import { writable } from 'svelte/store';

  import { page } from '$app/state';

  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import MenuDivider from '$lib/holocene/menu/menu-divider.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import { translate } from '$lib/i18n/translate';
  import IconFilter from '$lib/io/icon/icons/filter.svelte';
  import IconSearch from '$lib/io/icon/icons/search.svelte';
  import type { Callback } from '$lib/types/nexus';
  import {
    appliedCallbackFilterCount,
    CALLBACK_FILTER_FIELDS,
    type CallbackFilterField,
    callbackFilterOptions,
    type CallbackFilters,
    callbackFilterUpdate,
    limitCallbackFilterOptions,
    matchesCallbackFilterSearch,
    parseCallbackFilters,
  } from '$lib/utilities/nexus-operation-callback-filters';
  import { updateMultipleQueryParameters } from '$lib/utilities/update-query-parameters';

  let { callbacks }: { callbacks: Callback[] } = $props();

  const open = writable(false);
  let search = $state('');

  const fieldLabels: Record<CallbackFilterField, string> = {
    endpoint: translate('nexus.nexus-endpoint-column'),
    service: translate('nexus.nexus-service'),
    operation: translate('nexus.nexus-operation'),
  };

  const filters = $derived(parseCallbackFilters(page.url));
  const appliedCount = $derived(appliedCallbackFilterCount(filters));
  const options = $derived(callbackFilterOptions(callbacks));

  const setFilters = (next: CallbackFilters) => {
    updateMultipleQueryParameters({
      ...callbackFilterUpdate(next),
      url: page.url,
    });
  };

  const toggle = (field: CallbackFilterField, value: string) => {
    const selected = filters[field];
    setFilters({
      ...filters,
      [field]: selected.includes(value)
        ? selected.filter((selectedValue) => selectedValue !== value)
        : [...selected, value],
    });
  };

  const clearAll = () =>
    setFilters({ endpoint: [], service: [], operation: [] });
</script>

<MenuContainer {open}>
  <MenuButton
    controls="callbacks-filter-menu"
    count={appliedCount}
    hasIndicator
    size="sm"
  >
    {#snippet leading()}
      <IconFilter />
    {/snippet}
    {translate('common.filter')}
  </MenuButton>
  <Menu
    id="callbacks-filter-menu"
    keepOpen
    position="right"
    class="w-[280px] min-w-0 max-w-[calc(100dvw-1rem)] md:w-[380px]"
  >
    {#if $open}
      <li role="none" class="p-2">
        <Input
          id="callbacks-filter-search"
          bind:value={search}
          label={translate('common.search')}
          labelHidden
          Icon={IconSearch}
          type="search"
          placeholder={`${translate('common.search')}…`}
          clearable
          clearButtonLabel={translate('common.clear-input-button-label')}
        />
      </li>
      {#if appliedCount}
        <MenuItem onclick={clearAll}>
          {translate('common.clear-all')}
        </MenuItem>
      {/if}
      {#each CALLBACK_FILTER_FIELDS as field (field)}
        {@const matching = options[field].filter(({ value }) =>
          matchesCallbackFilterSearch(value, search),
        )}
        {@const visible = limitCallbackFilterOptions(matching, filters[field])}
        <MenuDivider />
        <li
          role="none"
          class="px-3 pb-1 pt-2 text-xs font-medium text-secondary"
        >
          {fieldLabels[field]}
        </li>
        {#each visible as { value, count } (value)}
          {@const checked = filters[field].includes(value)}
          <MenuItem onclick={() => toggle(field, value)} class="min-w-0">
            {#snippet leading()}
              <Checkbox
                onclick={() => toggle(field, value)}
                {checked}
                label={value}
                labelHidden
              />
            {/snippet}
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <span class="min-w-0 flex-1 whitespace-normal break-words"
                >{value}</span
              >
              <span class="shrink-0 text-xs text-secondary">{count}</span>
            </div>
          </MenuItem>
        {:else}
          <li role="none" class="px-3 py-2 text-sm text-secondary">
            {translate('common.no-results')}
          </li>
        {/each}
      {/each}
    {/if}
  </Menu>
</MenuContainer>
