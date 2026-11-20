<script lang="ts">
  import { page } from '$app/state';

  import Button from '$lib/holocene/button.svelte';
  import MenuButton from '$lib/holocene/menu/menu-button.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import MenuItem from '$lib/holocene/menu/menu-item.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import { translate } from '$lib/i18n/translate';
  import IconFilter from '$lib/io/icon/icons/filter.svelte';
  import {
    appliedCallbackFilterCount,
    CALLBACK_FILTER_FIELDS,
    CALLBACK_TARGET_TYPES,
    type CallbackChoiceField,
    type CallbackChoiceOption,
    type CallbackFilterField,
    type CallbackFilters,
    callbackFilterUpdate,
    type CallbackKeywordFilter,
    type CallbackTargetType,
    EMPTY_CALLBACK_FILTERS,
    isCallbackFilterActive,
    isCallbackKeywordField,
    parseCallbackFilters,
  } from '$lib/utilities/nexus-operation-callback-filters';
  import {
    CALLBACK_DELIVERY_STATES,
    callbackDeliveryState,
  } from '$lib/utilities/nexus-operation-callbacks';
  import { updateMultipleQueryParameters } from '$lib/utilities/update-query-parameters';

  import NexusOperationCallbacksChoiceFilterChip from './nexus-operation-callbacks-choice-filter-chip.svelte';
  import NexusOperationCallbacksKeywordFilterChip from './nexus-operation-callbacks-keyword-filter-chip.svelte';

  let editingField = $state<CallbackFilterField | null>(null);
  let addedField = $state<CallbackFilterField | null>(null);

  const fieldLabels: Record<CallbackFilterField, string> = {
    state: translate('nexus.delivery-state'),
    taskQueue: translate('common.task-queue'),
    service: translate('nexus.nexus-service'),
    operation: translate('nexus.nexus-operation'),
    targetType: translate('nexus.target-execution-type'),
  };

  const targetTypeLabels: Record<CallbackTargetType, string> = {
    workflow: translate('nexus.target-type-workflow-execution'),
    activity: translate('nexus.target-type-standalone-activity'),
    batchJob: translate('nexus.target-type-batch-job'),
  };

  const choiceOptions: Record<CallbackChoiceField, CallbackChoiceOption[]> = {
    state: CALLBACK_DELIVERY_STATES.map((state) => ({
      value: state,
      ...callbackDeliveryState(state),
    })),
    targetType: CALLBACK_TARGET_TYPES.map((type) => ({
      value: type,
      label: targetTypeLabels[type],
    })),
  };

  const filters = $derived(parseCallbackFilters(page.url));
  const appliedCount = $derived(appliedCallbackFilterCount(filters));
  const chipFields = $derived(
    CALLBACK_FILTER_FIELDS.filter(
      (field) =>
        isCallbackFilterActive(filters, field) || field === editingField,
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

  const settleChip = (field: CallbackFilterField, active: boolean) => {
    editingField = active ? field : null;
    if (addedField === field) addedField = null;
  };

  const applyKeyword = (
    field: CallbackFilterField,
    filter: CallbackKeywordFilter | null,
  ) => {
    settleChip(field, filter !== null);
    setFilters({ ...filters, [field]: filter });
  };

  const changeChoices = (field: CallbackChoiceField, values: string[]) => {
    setFilters({ ...filters, [field]: values });
  };

  const dismissChip = (field: CallbackFilterField) => {
    if (editingField === field) editingField = null;
    if (addedField === field) addedField = null;
  };

  const clearAll = () => {
    editingField = null;
    addedField = null;
    setFilters(EMPTY_CALLBACK_FILTERS);
  };
</script>

<div
  class="flex flex-wrap items-center gap-2 rounded-t-lg border border-b-0 border-primary bg-surface-primary p-1.5"
  data-testid="callbacks-filter-bar"
>
  {#each chipFields as field (field)}
    {#if isCallbackKeywordField(field)}
      <NexusOperationCallbacksKeywordFilterChip
        {field}
        label={fieldLabels[field]}
        filter={filters[field]}
        openOnMount={field === addedField}
        onApply={(filter) => applyKeyword(field, filter)}
        onDismiss={() => dismissChip(field)}
      />
    {:else}
      <NexusOperationCallbacksChoiceFilterChip
        {field}
        label={fieldLabels[field]}
        options={choiceOptions[field]}
        selected={filters[field]}
        openOnMount={field === addedField}
        onChange={(values) => changeChoices(field, values)}
        onDismiss={() => dismissChip(field)}
      />
    {/if}
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
