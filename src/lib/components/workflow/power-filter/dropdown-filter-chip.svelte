<script lang="ts">
  import { writable } from 'svelte/store';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Button from '$lib/holocene/button.svelte';
  import DatePicker from '$lib/holocene/date-picker.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Menu, MenuButton, MenuContainer } from '$lib/holocene/menu';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import ToggleButton from '$lib/holocene/toggle-button/toggle-button.svelte';
  import ToggleButtons from '$lib/holocene/toggle-button/toggle-buttons.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { workflowStatuses } from '$lib/models/workflow-status';
  import { timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';
  import { isNullConditional } from '$lib/utilities/is';
  import {
    isBooleanFilter,
    isDateTimeFilter,
    isListFilter,
    isNumberFilter,
    isStatusFilter,
    isTextFilter,
  } from '$lib/utilities/query/search-attribute-filter';

  type Props = {
    filter: SearchAttributeFilter;
    onUpdate: (updatedFilter: SearchAttributeFilter) => void;
    onRemove: () => void;
    index?: number;
    openIndex?: number;
  };

  let {
    filter,
    onUpdate,
    onRemove,
    index = 0,
    openIndex = null,
  }: Props = $props();

  const open = writable(false);
  let localFilter = $state({ ...filter });

  const controlsId = $derived(
    `dropdown-filter-chip-${filter.attribute}-${index}`,
  );
  let contentEl: HTMLDivElement;

  const defaultConditionOptions = [
    { value: 'is', label: translate('common.is-null') },
    { value: 'is not', label: translate('common.is-not-null') },
  ];

  const conditionalOptions = [
    { value: '=', label: translate('common.equal-to'), id: 'equal-to' },
    {
      value: '!=',
      label: translate('common.not-equal-to'),
      id: 'not-equal-to',
    },
    {
      value: 'STARTS_WITH',
      label: translate('common.starts-with'),
      id: 'starts-with',
    },
    ...defaultConditionOptions,
  ];

  const dateConditionalOptions = [
    { value: '<=', label: translate('common.before') },
    { value: 'BETWEEN', label: translate('common.between') },
    { value: '>=', label: translate('common.after') },
    ...defaultConditionOptions,
  ];

  const numberConditionalOptions = [
    { value: '>', label: '>', id: 'greater-than' },
    {
      value: '>=',
      label: '>=',
      id: 'greater-than-equal',
    },
    {
      value: '=',
      label: '=',
      id: 'equal-to',
    },
    {
      value: '!=',
      label: '!=',
      id: 'not-equal-to',
    },
    {
      value: '<=',
      label: '<=',
      id: 'less-than-equal',
    },
    { value: '<', label: '<', id: 'less-than' },
    ...defaultConditionOptions,
  ];

  const booleanConditionalOptions = [
    { value: 'true', label: translate('common.true'), id: 'is-true' },
    { value: 'false', label: translate('common.false'), id: 'is-false' },
  ];

  function getDisplayValue(filter: SearchAttributeFilter): string {
    const { attribute, value, conditional } = filter;

    if (isStatusFilter(filter)) {
      return `${attribute} = ${value}`;
    }

    if (isDateTimeFilter(filter)) {
      const formattedDate = formatDate(value, $timeFormat, {
        relative: true,
        abbrFormat: true,
      });
      const conditionText =
        conditional === '<'
          ? translate('common.before').toLowerCase()
          : conditional === '>'
            ? translate('common.after').toLowerCase()
            : conditional;
      return `${attribute} ${conditionText} ${formattedDate}`;
    }

    if (isTextFilter(filter)) {
      const conditionText =
        conditional === 'STARTS_WITH'
          ? translate('common.starts-with').toLowerCase()
          : conditional;
      return `${attribute} ${conditionText} "${value}"`;
    }

    return `${attribute} ${conditional} ${value}`;
  }

  const isNullFilter = $derived(isNullConditional(localFilter.conditional));

  function applyChanges(e) {
    e.preventDefault();
    console.log('Applying changes: ', localFilter);
    onUpdate(localFilter);
    $open = false;
  }

  function cancelChanges() {
    localFilter = { ...filter };
    $open = false;
  }

  function handleStatusSelect(status: string) {
    localFilter = {
      ...localFilter,
      value: status,
      conditional: '=',
    };
  }

  $effect(() => {
    if (openIndex === index) {
      $open = true;
    }
  });

  $effect(() => {
    if (!$open) {
      localFilter = { ...filter };
    }
  });
</script>

{#snippet conditionalButtons(options: { value: string; label: string }[])}
  <ToggleButtons>
    {#each options as option}
      <ToggleButton
        variant={localFilter.conditional === option.value
          ? 'primary'
          : 'secondary'}
        on:click={() => {
          if (isNullConditional(option.value)) {
            localFilter.value = null;
          }
          localFilter.conditional = option.value;
        }}
        size="xs">{option.label}</ToggleButton
      >
    {/each}
  </ToggleButtons>
{/snippet}

<MenuContainer {open}>
  <MenuButton size="xs" controls={controlsId} hasIndicator class="bg-secondary">
    {getDisplayValue(filter)}
  </MenuButton>

  <Menu id={controlsId} class="w-80 p-4">
    <form onsubmit={applyChanges}>
      <div class="space-y-4" bind:this={contentEl}>
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium">Filter by {filter.attribute}</h3>
        </div>

        {#if isStatusFilter(localFilter)}
          <div class="space-y-2">
            {#each workflowStatuses as status}
              <button
                class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-subtle"
                class:bg-primary={localFilter.value === status}
                class:text-primary-foreground={localFilter.value === status}
                onclick={() => handleStatusSelect(status)}
              >
                <WorkflowStatus {status} />
              </button>
            {/each}
          </div>
        {:else if isTextFilter(localFilter)}
          <div class="space-y-3">
            {@render conditionalButtons(conditionalOptions)}
            <Input
              id={`${controlsId}-text`}
              label="Value"
              placeholder="Enter value..."
              disabled={isNullFilter}
              bind:value={localFilter.value}
            />
          </div>
        {:else if isDateTimeFilter(localFilter)}
          <div class="space-y-3">
            {@render conditionalButtons(dateConditionalOptions)}
            <DatePicker
              label="Date"
              selected={new Date()}
              todayLabel={translate('common.today')}
              closeLabel={translate('common.close')}
              clearLabel={translate('common.clear-input-button-label')}
              on:datechange={(e) =>
                (localFilter = {
                  ...localFilter,
                  value: e.detail.toISOString(),
                })}
            />
          </div>
        {:else if isNumberFilter(localFilter)}
          <div class="space-y-3">
            {@render conditionalButtons(numberConditionalOptions)}
            <Input
              id={`${controlsId}-number`}
              label="Value"
              type="number"
              placeholder="Enter number..."
              disabled={isNullFilter}
              bind:value={localFilter.value}
            />
          </div>
        {:else if isListFilter(localFilter)}
          <div class="space-y-2">
            <Select
              id={`${controlsId}-list`}
              label="Select values"
              bind:value={localFilter.value}
            >
              <!-- Options would be populated based on the specific list type -->
              <Option value="option1">Option 1</Option>
              <Option value="option2">Option 2</Option>
              <Option value="option3">Option 3</Option>
            </Select>
          </div>
        {:else if isBooleanFilter(localFilter)}
          <div class="space-y-2">
            {@render conditionalButtons(booleanConditionalOptions)}
          </div>
        {:else}
          <div class="space-y-2">
            <Input
              id={`${controlsId}-generic`}
              label="Value"
              placeholder="Enter value..."
              bind:value={localFilter.value}
            />
            <Select
              id={`${controlsId}-cond`}
              label="Condition"
              bind:value={localFilter.conditional}
            >
              <Option value="=">{translate('common.equal-to')}</Option>
              <Option value="!=">{translate('common.not-equal-to')}</Option>
            </Select>
          </div>
        {/if}

        <div class="flex justify-end gap-2">
          <Button
            trailingIcon="close"
            variant="secondary"
            size="xs"
            type="button"
            on:click={onRemove}>Remove</Button
          >
          <Button
            variant="ghost"
            size="xs"
            type="button"
            on:click={cancelChanges}
          >
            Cancel
          </Button>
          <Button variant="primary" size="xs" type="submit">Apply</Button>
        </div>
      </div>
    </form>
  </Menu>
</MenuContainer>
