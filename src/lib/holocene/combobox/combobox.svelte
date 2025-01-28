<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { writable, type Writable } from 'svelte/store';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import ComboboxOption from '$lib/holocene/combobox/combobox-option.svelte';
  import Label from '$lib/holocene/label.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';

  import Badge from '../badge.svelte';
  import Button from '../button.svelte';
  import Chip from '../chip.svelte';
  import type { IconName } from '../icon';
  import Icon from '../icon/icon.svelte';
  import MenuDivider from '../menu/menu-divider.svelte';
  import Tooltip from '../tooltip.svelte';

  type T = $$Generic;

  type ExtendedInputEvent = Event & {
    currentTarget: EventTarget & HTMLInputElement;
  };

  interface BaseProps extends HTMLInputAttributes {
    id: string;
    label: string;
    noResultsText: string;
    disabled?: boolean;
    labelHidden?: boolean;
    placeholder?: string;
    readonly?: boolean;
    required?: boolean;
    leadingIcon?: IconName;
    minSize?: number;
    maxSize?: number;
    'data-testid'?: string;
    error?: string;
    valid?: boolean;
    actionTooltip?: string;
    href?: string;
    hrefDisabled?: boolean;
    loading?: boolean;
    loadingText?: string;
    open?: Writable<boolean>;
    maxMenuHeight?: string;
    action?: Snippet;
    change?: (args: { value: string | T }) => void;
    filter?: (arg: string) => void;
    close?: (args: { selectedOption: string | T }) => void;
    input?: (arg: string) => void;
    class?: string;
  }

  type MultiSelectProps = {
    multiselect: true;
    value: string[];
    displayChips?: boolean;
    chipLimit?: number;
    removeChipLabel?: string;
    selectAllLabel?: string;
    selectNoneLabel?: string;
    deselectAllLabel?: string;
    numberOfItemsSelectedLabel?: (count: number) => string;
  };

  type SingleSelectProps = {
    multiselect?: false;
    value: string;
    chipLimit?: never;
    displayChips?: never;
    selectAllLabel?: never;
    selectNoneLabel?: never;
    deselectAllLabel?: never;
    removeChipLabel?: never;
    numberOfItemsSelectedLabel?: never;
  };

  type StringOptionProps = {
    options: string[];
    optionValueKey?: never;
    optionLabelKey?: never;
  };

  type CustomOptionProps = {
    options: T[];
    optionValueKey: keyof T;
    optionLabelKey?: keyof T;
  };

  type Props =
    | (BaseProps & StringOptionProps & SingleSelectProps)
    | (BaseProps & StringOptionProps & MultiSelectProps)
    | (BaseProps & CustomOptionProps & SingleSelectProps)
    | (BaseProps & CustomOptionProps & MultiSelectProps);

  let {
    id,
    label,
    multiselect = false,
    value = $bindable(multiselect ? [] : undefined),
    noResultsText,
    disabled = false,
    labelHidden = false,
    options,
    placeholder = null,
    readonly = false,
    required = false,
    leadingIcon = null,
    optionValueKey = null,
    optionLabelKey = optionValueKey,
    minSize = 0,
    maxSize = 120,
    error = '',
    valid = true,
    displayChips = true,
    chipLimit = 5,
    selectAllLabel = 'Select All',
    deselectAllLabel = 'Deselect All',
    removeChipLabel = 'Remove Option',
    actionTooltip = '',
    href = '',
    hrefDisabled = false,
    loading = false,
    loadingText = 'Loading more results',
    numberOfItemsSelectedLabel = (count: number) =>
      `${count} option${count > 1 ? 's' : ''} selected`,
    open = writable<boolean>(false),
    maxMenuHeight = 'max-h-[20rem]',
    action,
    change = () => {},
    filter = () => {},
    close = () => {},
    input = () => {},
    class: className = '',
    ...rest
  }: Props = $props();

  let displayValue: string = $state('');
  // Filter value and display value are close but different in a few cases
  // primary difference is when opening a select box display value is filled
  // and filter value should be blank
  let filterValue: string = $state('');
  let selectedOption: string | T = $state();
  let menuElement: HTMLUListElement = $state();
  let inputElement: HTMLInputElement = $state();

  // We need this piece of code to focus the element when externally modifying the
  // open store. Specifically we use this behaviour in bottom nav to focus the combobox
  // after the bottom nav is clicked
  $effect(() => {
    if ($open && inputElement && document.activeElement !== inputElement) {
      inputElement.focus();
      inputElement.select();
    }
  });

  // We want this to react to external changes to the options prop to support async use cases
  let list = $derived(filterOptions(filterValue, options));

  $effect(() => {
    if (inputElement && displayValue) {
      if (displayValue.length < minSize) {
        inputElement.size = minSize;
      } else if (displayValue.length > maxSize) {
        inputElement.size = maxSize;
      } else {
        inputElement.size = displayValue.length;
      }
    }
  });

  const openList = (event?: FocusEvent) => {
    event?.stopPropagation();
    $open = true;
    filterValue = '';
    inputElement.focus();
    inputElement.select();
  };

  const closeList = () => {
    if (!$open) return;
    $open = false;
    close({ selectedOption });
    resetValueAndOptions();
  };

  const handleMenuClose = () => {
    close({ selectedOption });
    resetValueAndOptions();
  };

  const resetValueAndOptions = () => {
    displayValue = getDisplayValue(selectedOption);
    filterValue = displayValue;
  };

  const isArrayValue = (value: string | string[]): value is string[] => {
    return Array.isArray(value);
  };

  const isStringOption = (option: string | T): option is string => {
    return typeof option === 'string';
  };

  const isObjectOption = (option: string | T): option is T & object => {
    return typeof option === 'object';
  };

  const canRenderCustomOption = (option: T) => {
    if (option === null) return false;
    if (typeof option !== 'object') return false;

    return (
      optionValueKey !== null &&
      optionLabelKey !== null &&
      optionValueKey in option &&
      optionLabelKey in option
    );
  };

  const getDisplayValue = (option: string | T | undefined): string => {
    if (!option) {
      if (isArrayValue(value)) {
        return '';
      }

      return value ?? '';
    }

    if (isStringOption(option)) {
      return option;
    }

    if (isObjectOption(option) && canRenderCustomOption(option)) {
      return String(option[optionLabelKey]);
    }
  };

  $effect(() => {
    if (!multiselect) {
      selectedOption = options.find((option) => {
        if (isStringOption(option)) {
          return option === value;
        }

        if (isObjectOption(option) && canRenderCustomOption(option)) {
          return option[optionValueKey] === value;
        }
      });

      displayValue = getDisplayValue(selectedOption);
    }
  });

  /**
   * Given an option that could be an object of type T set internal value in the component to string/string[]
   * or cast it to a string
   * @param option
   */
  const setValue = (option: string | T): void => {
    if (isStringOption(option)) {
      if (isArrayValue(value)) {
        if (value.includes(option)) {
          value = value.filter((o) => o !== option);
        } else {
          value = [...value, option];
        }
      } else {
        value = option;
      }
    }

    if (isObjectOption(option) && canRenderCustomOption(option)) {
      const opt = String(option[optionValueKey]);
      if (isArrayValue(value)) {
        if (value.includes(opt)) {
          value = value.filter((o) => o !== opt);
        } else {
          value = [...value, opt];
        }
      } else {
        value = opt;
      }
    }
  };

  const handleSelectOption = (option: string | T) => {
    setValue(option);
    change({ value: option });
    if (!multiselect) {
      resetValueAndOptions();
    }
  };

  const removeOption = (option: string) => {
    if (isArrayValue(value)) {
      value = value.filter((o) => o !== option);
    }
  };

  const selectAll = () => {
    if (!multiselect || !isArrayValue(value)) return;

    value = list.map((option) => {
      if (isObjectOption(option) && canRenderCustomOption(option)) {
        return String(option[optionValueKey]);
      } else if (isStringOption(option)) {
        return option;
      }
    });
  };

  const deselectAll = () => {
    value = [];
  };

  const focusFirstOption = () => {
    const listItemElement: HTMLLIElement = menuElement.querySelector(
      'li[role="option"]:not([aria-disabled="true"])',
    );

    if (listItemElement) {
      requestAnimationFrame(() => listItemElement.focus());
    }
  };

  const handleInputKeydown = (event: KeyboardEvent) => {
    event.stopPropagation();
    switch (event.key) {
      case 'Escape':
        closeList();
        break;
      case 'ArrowDown':
        openList();
        focusFirstOption();
        break;
      case 'Enter':
        openList();
        focusFirstOption();
        break;
      case 'ArrowUp':
      case 'ArrowRight':
      case 'ArrowLeft':
        break;
      default:
        break;
    }
  };

  const handleInput = (event: ExtendedInputEvent) => {
    event.stopPropagation();
    if (!$open) $open = true;
    // Reactive statement at top makes this work, not my favorite tho
    displayValue = event.currentTarget.value;
    filterValue = displayValue;
    input(displayValue);
  };

  function filterOptions(value: string, options: (T | string)[]) {
    filter(displayValue);

    return options.filter((option) => {
      if (isStringOption(option)) {
        return option.toLowerCase().includes(value.toLowerCase());
      }

      if (isObjectOption(option) && canRenderCustomOption(option)) {
        return String(option[optionLabelKey])
          .toLowerCase()
          .includes(value.toLowerCase());
      }
    });
  }

  const handleInputClick = (event: MouseEvent) => {
    event.stopPropagation();
    if (!$open) openList();
  };

  const isSelected = (
    option: string | T,
    value: string | string[],
  ): boolean => {
    if (isObjectOption(option)) {
      const o = String(option[optionValueKey]);
      return isArrayValue(value) ? value.includes(o) : value === o;
    } else if (isStringOption(option)) {
      return isArrayValue(value) ? value.includes(option) : value === option;
    }

    return false;
  };
</script>

<MenuContainer {open} close={handleMenuClose}>
  <Label class="pb-1" hidden={labelHidden} {required} {label} for={id} />

  <div class="combobox-wrapper" class:disabled class:invalid={!valid}>
    {#if leadingIcon}
      <Icon width={20} height={20} class="ml-2" name={leadingIcon} />
    {/if}
    <div
      class="input-wrapper"
      class:gap-1={multiselect}
      class:py-1={multiselect && displayChips}
    >
      {#if multiselect && isArrayValue(value) && value.length > 0}
        {#if displayChips}
          {#each value.slice(0, chipLimit) as v}
            <Chip
              remove={() => removeOption(v)}
              removeButtonLabel={removeChipLabel}>{v}</Chip
            >
          {/each}
          {#if value.length > chipLimit}
            <p>+{value.slice(chipLimit).length}</p>
          {/if}
        {:else}
          <Badge>{numberOfItemsSelectedLabel(value.length)}</Badge>
        {/if}
      {/if}
      <input
        {id}
        {placeholder}
        {required}
        {readonly}
        {disabled}
        type="text"
        value={displayValue}
        class:disabled
        class={merge('combobox-input', className)}
        role="combobox"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        data-lpignore="true"
        data-1p-ignore="true"
        aria-controls="{id}-listbox"
        aria-expanded={$open}
        aria-required={required}
        aria-autocomplete="list"
        onfocus={openList}
        oninput={handleInput}
        onkeydown={handleInputKeydown}
        onclick={handleInputClick}
        data-testid={rest['data-testid'] ?? id}
        bind:this={inputElement}
        {...rest}
      />
    </div>
    {#if action}
      <div class="ml-1 flex h-full items-center border-l border-subtle p-0.5">
        {#if actionTooltip}
          <Tooltip text={actionTooltip} right>
            {@render action()}
          </Tooltip>
        {:else}
          {@render action()}
        {/if}
      </div>
    {:else if href}
      <div class="ml-1 flex h-full items-center border-l border-subtle p-0.5">
        {#if actionTooltip}
          <Tooltip text={actionTooltip} right>
            <Button
              variant="ghost"
              size="xs"
              {href}
              disabled={hrefDisabled}
              leadingIcon="external-link"
            />
          </Tooltip>
        {:else}
          <Button
            variant="ghost"
            size="xs"
            {href}
            disabled={hrefDisabled}
            leadingIcon="external-link"
          />
        {/if}
      </div>
    {/if}
  </div>

  <Menu
    keepOpen={multiselect}
    bind:menuElement
    id="{id}-listbox"
    role="listbox"
    class="w-full"
    maxHeight={maxMenuHeight}
  >
    {#if multiselect && isArrayValue(value)}
      <ComboboxOption
        disabled={value.length === options.length}
        onclick={selectAll}
        label={selectAllLabel}
      />
      <ComboboxOption
        disabled={value.length === 0}
        onclick={deselectAll}
        label={deselectAllLabel}
      />
      <MenuDivider />
    {/if}

    {#each list as option}
      <ComboboxOption
        onclick={() => handleSelectOption(option)}
        selected={isSelected(option, value)}
        label={getDisplayValue(option)}
      />
    {:else}
      {#if loading === false}
        <ComboboxOption disabled label={noResultsText} />
      {/if}
    {/each}

    {#if loading}
      <ComboboxOption disabled label={loadingText}>
        {#snippet leading()}
          <Icon name="spinner" class="animate-spin" />
        {/snippet}
      </ComboboxOption>
    {/if}
  </Menu>

  {#if error && !valid}
    <span class="error">{error}</span>
  {/if}
</MenuContainer>

<style lang="postcss">
  .combobox-wrapper {
    @apply surface-primary flex max-h-28 min-h-10 w-full flex-row items-center overflow-auto border border-subtle text-sm dark:focus-within:surface-primary focus-within:border-interactive focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/70;

    &.invalid {
      @apply border border-danger text-danger focus-within:ring-danger/70;
    }

    &.disabled {
      @apply opacity-50;
    }
  }

  .error {
    @apply text-xs text-danger;
  }

  .input-wrapper {
    @apply ml-2 flex w-full flex-wrap items-center;
  }

  .combobox-input {
    @apply flex grow bg-transparent text-primary placeholder:text-secondary focus:outline-none;
  }
</style>
