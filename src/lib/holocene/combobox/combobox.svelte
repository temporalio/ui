<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';
  import { writable } from 'svelte/store';

  import { createEventDispatcher } from 'svelte';

  import ComboboxOption from '$lib/holocene/combobox/combobox-option.svelte';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';

  import Icon from '../icon/icon.svelte';
  import type { IconName } from '../icon/paths';
  import IconButton from '../icon-button.svelte';

  type T = $$Generic;

  const dispatch = createEventDispatcher<{
    change: T | string;
    filter: string;
  }>();

  type ExtendedInputEvent = Event & {
    currentTarget: EventTarget & HTMLInputElement;
  };

  interface BaseProps extends HTMLInputAttributes {
    id: string;
    label: string;
    toggleLabel: string;
    value: string;
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
  }

  type UncontrolledStringOptionProps = {
    options: string[];
    optionValueKey?: never;
    optionLabelKey?: never;
    displayValue?: never;
  };

  type UncontrolledCustomOptionProps = {
    options: T[];
    optionValueKey: keyof T;
    optionLabelKey?: keyof T;
  };

  type $$Props =
    | (BaseProps & UncontrolledStringOptionProps)
    | (BaseProps & UncontrolledCustomOptionProps);

  let className = '';
  export { className as class };
  export let id: string;
  export let label: string;
  export let value: string = undefined;
  export let toggleLabel: string;
  export let noResultsText: string;
  export let disabled = false;
  export let labelHidden = false;
  export let options: (T | string)[];
  export let placeholder: string = null;
  export let readonly = false;
  export let required = false;
  export let leadingIcon: IconName = null;
  export let optionValueKey: keyof T = null;
  export let optionLabelKey: keyof T = optionValueKey;
  export let minSize = 0;
  export let maxSize = 120;

  let displayValue: string;
  let selectedOption: string | T;
  let menuElement: HTMLUListElement;
  let inputElement: HTMLInputElement;
  const open = writable<boolean>(false);
  $: list = options;

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

  $: {
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

  const toggleList = () => {
    if ($open) {
      closeList();
    } else {
      openList();
    }
  };

  const openList = () => {
    $open = true;
  };

  const closeList = () => {
    if (!$open) return;
    $open = false;
    resetValueAndOptions();
  };

  const resetValueAndOptions = () => {
    displayValue = getDisplayValue(selectedOption);
    list = options;
  };

  const narrowOption = (option: unknown): T => option as T;

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
    if (!option) return value ?? '';

    if (isStringOption(option)) {
      return option;
    }

    if (isObjectOption(option) && canRenderCustomOption(option)) {
      return String(option[optionLabelKey]);
    }
  };

  const setValue = (option: string | T): void => {
    if (isStringOption(option)) {
      value = option;
    }

    if (isObjectOption(option) && canRenderCustomOption(option)) {
      value = String(option[optionValueKey]);
    }
  };

  const handleSelectOption = (option: string | T) => {
    dispatch('change', option);
    setValue(option);
    resetValueAndOptions();
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
    displayValue = event.currentTarget.value;
    dispatch('filter', displayValue);
    if (!$open) openList();

    list = options.filter((option) => {
      if (isStringOption(option)) {
        return option
          .toLowerCase()
          .includes(event.currentTarget.value.toLowerCase());
      }

      if (isObjectOption(option) && canRenderCustomOption(option)) {
        return String(option[optionLabelKey])
          .toLowerCase()
          .includes(event.currentTarget.value.toLowerCase());
      }
    });
  };

  const handleInputClick = () => {
    if (!$open) openList();
  };
</script>

<MenuContainer {open} on:close={resetValueAndOptions}>
  <label class="combobox-label" class:sr-only={labelHidden} for={id}>
    {label}
  </label>

  <div
    class="text-sm w-full h-10 flex flex-row items-center rounded-lg bg-white border border-primary"
  >
    {#if leadingIcon}
      <Icon
        width={20}
        height={20}
        class="mx-3 shrink-0 text-gray-500"
        name={leadingIcon}
      />
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
      class="combobox-input {className}"
      role="combobox"
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
      data-lpignore="true"
      aria-controls="{id}-listbox"
      aria-expanded={$open}
      aria-required={required}
      aria-autocomplete="list"
      on:input|stopPropagation={handleInput}
      on:keydown|stopPropagation={handleInputKeydown}
      on:click|stopPropagation={handleInputClick}
      data-testid={$$props['data-testid'] ?? id}
      bind:this={inputElement}
      {...$$restProps}
    />
    <IconButton
      label={toggleLabel}
      class="h-full w-10 shrink-0"
      tabindex={-1}
      icon={$open ? 'chevron-up' : 'chevron-down'}
      aria-controls="{id}-listbox"
      aria-expanded={$open}
      on:click={toggleList}
    />
  </div>

  <Menu bind:menuElement id="{id}-listbox" role="listbox" class="w-full">
    {#each list as option}
      {#if isStringOption(option)}
        <ComboboxOption
          on:click={() => handleSelectOption(option)}
          selected={value === option}
        >
          {option}
        </ComboboxOption>
      {:else if isObjectOption(option)}
        {#if canRenderCustomOption(option)}
          <ComboboxOption
            on:click={() => handleSelectOption(option)}
            selected={value === option[optionValueKey]}
          >
            {option[optionLabelKey]}
          </ComboboxOption>
        {:else}
          <slot option={narrowOption(option)} />
        {/if}
      {/if}
    {:else}
      <ComboboxOption disabled>{noResultsText}</ComboboxOption>
    {/each}
  </Menu>
</MenuContainer>

<style lang="postcss">
  .combobox-label {
    @apply font-secondary text-sm font-normal;
  }

  .combobox-input {
    @apply h-full w-full font-primary focus:outline-none focus:border-indigo-600;
  }
</style>
