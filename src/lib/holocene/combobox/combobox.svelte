<script context="module" lang="ts">
  import { cva, type VariantProps } from 'class-variance-authority';

  const comboboxStyles = cva(
    [
      'surface-primary',
      'flex',
      'max-h-28',
      'min-h-10',
      'w-full',
      'flex-row',
      'items-center',
      'overflow-auto',
      'border',
      'text-sm',
      'dark:focus-within:surface-primary',
      'focus-within:outline-none',
      'focus-within:ring-2',
    ],
    {
      variants: {
        variant: {
          default:
            'border-subtle focus-within:border-interactive focus-within:ring-primary/70',
          ghost:
            'bg-transparent border-transparent focus-within:border-transparent focus-within:ring-transparent focus-within:bg-transparent hover:surface-interactive-secondary',
        },
      },
      defaultVariants: {
        variant: 'default',
      },
    },
  );

  export type ComboboxStyles = VariantProps<typeof comboboxStyles>;
</script>

<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { writable, type Writable } from 'svelte/store';

  import { createEventDispatcher } from 'svelte';
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

  const dispatch = createEventDispatcher<{
    change: { value: string | T };
    filter: string;
    close: { selectedOption: string | T };
    input: string;
  }>();

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
    showChevron?: boolean;
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
    variant?: ComboboxStyles['variant'];
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
    numberOfItemsSelectedLabel?: (count: number) => string;
  };

  type SingleSelectProps = {
    multiselect?: false;
    value: string;
    chipLimit?: never;
  };

  type StringOptionProps = {
    options: string[];
    optionValueKey?: never;
    optionLabelKey?: never;
    displayValue?: never;
  };

  type CustomOptionProps = {
    options: T[];
    optionValueKey: keyof T;
    optionLabelKey?: keyof T;
  };

  type $$Props =
    | (BaseProps & StringOptionProps & SingleSelectProps)
    | (BaseProps & StringOptionProps & MultiSelectProps)
    | (BaseProps & CustomOptionProps & SingleSelectProps)
    | (BaseProps & CustomOptionProps & MultiSelectProps);

  let className = '';
  export { className as class };
  export let id: string;
  export let label: string;
  export let multiselect = false;
  export let value: string | string[] = multiselect ? [] : undefined;
  export let noResultsText: string;
  export let disabled = false;
  export let labelHidden = false;
  export let options: (T | string)[];
  export let placeholder: string = null;
  export let readonly = false;
  export let required = false;
  export let leadingIcon: IconName = null;
  export let showChevron = false;
  export let optionValueKey: keyof T = null;
  export let optionLabelKey: keyof T = optionValueKey;
  export let minSize = 0;
  export let maxSize = 120;
  export let error = '';
  export let valid = true;
  export let displayChips = true;
  export let chipLimit = 5;
  export let selectAllLabel = 'Select All';
  export let deselectAllLabel = 'Deselect All';
  export let removeChipLabel = 'Remove Option';
  export let actionTooltip = '';
  export let href = '';
  export let hrefDisabled = false;
  export let loading = false;
  export let loadingText = 'Loading more results';
  export let variant: ComboboxStyles['variant'] = 'default';

  export let numberOfItemsSelectedLabel = (count: number) =>
    `${count} option${count > 1 ? 's' : ''} selected`;

  let displayValue: string = '';
  // Filter value and display value are close but different in a few cases
  // primary difference is when opening a select box display value is filled
  // and filter value should be blank
  let filterValue: string = '';
  let selectedOption: string | T;
  let menuElement: HTMLUListElement;
  let inputElement: HTMLInputElement;

  export let open = writable<boolean>(false);
  export let maxMenuHeight: string = 'max-h-[20rem]';

  // We need this piece of code to focus the element when externally modifying the
  // open store. Specifically we use this behaviour in bottom nav to focus the combobox
  // after the bottom nav is clicked
  $: {
    if ($open && inputElement && document.activeElement !== inputElement) {
      inputElement.focus();
      inputElement.select();
    }
  }

  // We want this to react to external changes to the options prop to support async use cases
  $: list = filterOptions(filterValue, options);

  $: {
    if (inputElement && displayValue) {
      if (displayValue.length < minSize) {
        inputElement.size = minSize;
      } else if (displayValue.length > maxSize) {
        inputElement.size = maxSize;
      } else {
        inputElement.size = displayValue.length;
      }
    }
  }

  $: if (!multiselect) {
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

  const openList = () => {
    $open = true;
    filterValue = '';
    inputElement.focus();
    inputElement.select();
  };

  const closeList = () => {
    if (!$open) return;
    $open = false;
    dispatch('close', { selectedOption });
    resetValueAndOptions();
  };

  const handleMenuClose = () => {
    dispatch('close', { selectedOption });
    resetValueAndOptions();
  };

  const resetValueAndOptions = () => {
    displayValue = getDisplayValue(selectedOption);
    list = options;
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
    dispatch('change', { value: option });
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
    if (!$open) $open = true;
    // Reactive statement at top makes this work, not my favorite tho
    displayValue = event.currentTarget.value;
    filterValue = displayValue;
    dispatch('input', displayValue);
  };

  function filterOptions(value: string, options: (T | string)[]) {
    dispatch('filter', displayValue);

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

  const handleInputClick = () => {
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

<MenuContainer {open} on:close={handleMenuClose}>
  <Label class="pb-1" hidden={labelHidden} {required} {label} for={id} />

  <div
    class={merge(
      comboboxStyles({ variant }),
      !valid &&
        variant === 'default' &&
        'border border-danger text-danger focus-within:ring-danger/70',
      disabled && 'opacity-50',
      className,
    )}
    class:disabled
  >
    {#if leadingIcon}
      <Icon class="ml-2 shrink-0" name={leadingIcon} />
    {/if}
    <div
      class={merge(
        'input-wrapper',
        multiselect && 'gap-1',
        multiselect && 'm-1',
        leadingIcon && multiselect && 'ml-2',
      )}
    >
      {#if multiselect && isArrayValue(value) && value.length > 0}
        {#if displayChips}
          {#each value.slice(0, chipLimit) as v}
            <Chip
              on:remove={() => removeOption(v)}
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
        class={merge(
          'combobox-input',
          multiselect
            ? value.length > 0 || leadingIcon
              ? 'indent-0'
              : 'indent-1'
            : 'indent-2',
          className,
        )}
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
        on:focus|stopPropagation={openList}
        on:input|stopPropagation={handleInput}
        on:keydown|stopPropagation={handleInputKeydown}
        on:click|stopPropagation={handleInputClick}
        data-testid={$$props['data-testid'] ?? id}
        bind:this={inputElement}
        {...$$restProps}
      />
    </div>
    {#if $$slots.action}
      <div class="ml-1 flex h-full items-start border-l border-subtle p-0.5">
        {#if actionTooltip}
          <Tooltip text={actionTooltip} right>
            <slot name="action" />
          </Tooltip>
        {:else}
          <slot name="action" />
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
    {#if showChevron}
      <button
        type="button"
        class="hover:bg-gray-100 flex h-full items-center rounded pr-2 focus:outline-none"
        on:click|stopPropagation={() => ($open ? closeList() : openList())}
        aria-label={$open ? 'Close options' : 'Open options'}
        tabindex="-1"
      >
        <Icon
          name="chevron-down"
          class={merge(
            'transition-transform duration-200',
            $open && 'rotate-180',
            !$open && 'rotate-0',
          )}
        />
      </button>
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
        on:click={selectAll}
        label={selectAllLabel}
      />
      <ComboboxOption
        disabled={value.length === 0}
        on:click={deselectAll}
        label={deselectAllLabel}
      />
      <MenuDivider />
    {/if}

    {#each list as option}
      <ComboboxOption
        on:click={() => handleSelectOption(option)}
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
        <Icon slot="leading" name="spinner" class="animate-spin" />
      </ComboboxOption>
    {/if}
  </Menu>

  {#if error && !valid}
    <span class="error">{error}</span>
  {/if}
</MenuContainer>

<style lang="postcss">
  .error {
    @apply text-xs text-danger;
  }

  .input-wrapper {
    @apply flex w-full flex-wrap items-center;
  }

  .combobox-input {
    @apply flex grow bg-transparent text-primary placeholder:text-secondary focus:outline-none;
  }
</style>
