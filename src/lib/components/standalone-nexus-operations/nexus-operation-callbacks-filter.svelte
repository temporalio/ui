<script lang="ts">
  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import { translate } from '$lib/i18n/translate';
  import IconFilter from '$lib/io/icon/icons/filter.svelte';
  import type { Callback } from '$lib/types/nexus';
  import {
    appliedCallbackFilterCount,
    CALLBACK_FILTER_FIELDS,
    type CallbackFilterField,
    callbackFilterOptions,
    type CallbackFilters,
    callbackFilterUpdate,
    parseCallbackFilters,
  } from '$lib/utilities/nexus-operation-callback-filters';
  import { updateMultipleQueryParameters } from '$lib/utilities/update-query-parameters';

  import NexusOperationCallbacksFilterChip from './nexus-operation-callbacks-filter-chip.svelte';

  let { callbacks }: { callbacks: Callback[] } = $props();

  let editingField = $state<CallbackFilterField | null>(null);
  let addedField = $state<CallbackFilterField | null>(null);

  const fieldLabels: Record<CallbackFilterField, string> = {
    endpoint: translate('nexus.nexus-endpoint-column'),
    service: translate('nexus.nexus-service'),
    operation: translate('nexus.nexus-operation'),
  };

  const filters = $derived(parseCallbackFilters(page.url));
  const appliedCount = $derived(appliedCallbackFilterCount(filters));
  const options = $derived(callbackFilterOptions(callbacks));
  const chipFields = $derived(
    CALLBACK_FILTER_FIELDS.filter(
      (field) => filters[field].length > 0 || field === editingField,
    ),
  );

  const setFilters = (next: CallbackFilters) => {
    updateMultipleQueryParameters({
      ...callbackFilterUpdate(next),
      url: page.url,
    });
  };

  const addFilter = (field: CallbackFilterField) => {
    editingField = field;
    addedField = field;
  };

  const toggle = (field: CallbackFilterField, value: string) => {
    editingField = field;
    const selected = filters[field];
    setFilters({
      ...filters,
      [field]: selected.includes(value)
        ? selected.filter((selectedValue) => selectedValue !== value)
        : [...selected, value],
    });
  };

  const closeChip = (field: CallbackFilterField) => {
    if (editingField === field) editingField = null;
    if (addedField === field) addedField = null;
  };

  const clearAll = () => {
    editingField = null;
    addedField = null;
    setFilters({ endpoint: [], service: [], operation: [] });
  };
</script>

<div
  class="flex flex-wrap items-center gap-2 rounded-t-lg border border-b-0 border-primary bg-surface-primary p-1.5"
  data-testid="callbacks-filter-bar"
>
  {#each chipFields as field (field)}
    <NexusOperationCallbacksFilterChip
      {field}
      label={fieldLabels[field]}
      options={options[field]}
      selected={filters[field]}
      openOnMount={field === addedField}
      onToggle={(value) => toggle(field, value)}
      onClose={() => closeChip(field)}
    />
  {/each}
  <MenuContainer>
    <MenuButton
      controls="callbacks-add-filter-menu"
      LeadingIcon={IconFilter}
      variant="tertiary"
      size="xs"
      class="text-nowrap"
      data-testid="callbacks-add-filter-button"
    >
      {translate('nexus.add-filter')}
    </MenuButton>
    <Menu id="callbacks-add-filter-menu" usePortal>
      {#each CALLBACK_FILTER_FIELDS as field (field)}
        <MenuItem
          onclick={() => addFilter(field)}
          disabled={chipFields.includes(field)}
        >
          {fieldLabels[field]}
        </MenuItem>
      {/each}
    </Menu>
  </MenuContainer>
  {#if appliedCount > 0}
    <Button
      variant="ghost"
      size="xs"
      onclick={clearAll}
      data-testid="callbacks-clear-all-filters"
    >
      {translate('common.clear-all')}
    </Button>
  {/if}
</div>
