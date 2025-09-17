<script lang="ts">
  import { writable } from 'svelte/store';

  import WorkflowStatus from '$lib/components/workflow-status.svelte';
  import Button from '$lib/holocene/button.svelte';
  import DatePicker from '$lib/holocene/date-picker.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { Menu, MenuButton, MenuContainer } from '$lib/holocene/menu';
  import Option from '$lib/holocene/select/option.svelte';
  import Select from '$lib/holocene/select/select.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { workflowStatuses } from '$lib/models/workflow-status';
  import { timeFormat } from '$lib/stores/time-format';
  import { formatDate } from '$lib/utilities/format-date';
  import {
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
  ];

  const dateConditionalOptions = [
    { value: '<', label: translate('common.before'), id: 'before' },
    { value: '>', label: translate('common.after'), id: 'after' },
    { value: '=', label: translate('common.equal-to'), id: 'equal-to' },
  ];

  const numberConditionalOptions = [
    { value: '=', label: translate('common.equal-to'), id: 'equal-to' },
    {
      value: '!=',
      label: translate('common.not-equal-to'),
      id: 'not-equal-to',
    },
    { value: '<', label: translate('common.less-than'), id: 'less-than' },
    { value: '>', label: translate('common.greater-than'), id: 'greater-than' },
    {
      value: '<=',
      label: translate('common.less-than-or-equal-to'),
      id: 'less-than-equal',
    },
    {
      value: '>=',
      label: translate('common.greater-than-or-equal-to'),
      id: 'greater-than-equal',
    },
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

  function applyChanges() {
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

  // function setConditional(conditional: string) {
  //   localFilter = {
  //     ...localFilter,
  //     conditional,
  //   };
  // }

  $effect(() => {
    if (openIndex === index) {
      $open = true;
    }
  });

  function focusFirstInMenu() {
    if (!contentEl) return;
    const el = contentEl.querySelector<HTMLElement>(
      'input:not([disabled]), button:not([disabled]), [role="menuitem"], [tabindex]:not([tabindex="-1"])',
    );
    if (el) el.focus();
  }

  $effect(() => {
    if ($open) {
      // wait for DOM to render
      setTimeout(focusFirstInMenu, 0);
    }
  });
</script>

<MenuContainer {open}>
  <MenuButton size="xs" controls={controlsId} hasIndicator class="bg-indigo-50">
    {getDisplayValue(filter)}
  </MenuButton>

  <Menu id={controlsId} class="w-80 p-4">
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
          <Select
            id={`${controlsId}-text-cond`}
            label="Condition"
            bind:value={localFilter.conditional}
          >
            {#each conditionalOptions as option}
              <Option value={option.value}>{option.label}</Option>
            {/each}
          </Select>
          <Input
            id={`${controlsId}-text`}
            label="Value"
            placeholder="Enter value..."
            bind:value={localFilter.value}
          />
        </div>
      {:else if isDateTimeFilter(localFilter)}
        <div class="space-y-3">
          <Select
            id={`${controlsId}-date-cond`}
            label="Condition"
            bind:value={localFilter.conditional}
          >
            {#each dateConditionalOptions as option}
              <Option value={option.value}>{option.label}</Option>
            {/each}
          </Select>
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
          <Select
            id={`${controlsId}-num-cond`}
            label="Condition"
            bind:value={localFilter.conditional}
          >
            {#each numberConditionalOptions as option}
              <Option value={option.value}>{option.label}</Option>
            {/each}
          </Select>
          <Input
            id={`${controlsId}-number`}
            label="Value"
            type="number"
            placeholder="Enter number..."
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
        <Button variant="destructive" size="xs" on:click={onRemove}
          >Remove</Button
        >
        <Button variant="ghost" size="xs" on:click={cancelChanges}>
          Cancel
        </Button>
        <Button variant="primary" size="xs" on:click={applyChanges}>
          Apply
        </Button>
      </div>
    </div>
  </Menu>
</MenuContainer>
