<script lang="ts" generics="T extends object">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { clickOutside } from '../outside-click';
  import ComboboxOption from './combobox-option.svelte';

  type ExtendedInputEvent = Event & {
    currentTarget: EventTarget & HTMLInputElement;
  };

  type ExtendedUListEvent = KeyboardEvent & {
    currentTarget: EventTarget & HTMLUListElement;
    target: HTMLLIElement;
  };

  type BaseProps = {
    id: string;
    label: string;
    value: string;
    noResultsText: string;
    disabled?: boolean;
    labelHidden?: boolean;
    placeholder?: string;
    readonly?: boolean;
    required?: boolean;
  };

  type DefaultOptionsProps = {
    options: string[];
  };

  type CustomOptionsProps = {
    options: T[];
    optionValueKey: keyof T;
    optionLabelKey?: keyof T;
  };

  type $$Props =
    | (BaseProps & DefaultOptionsProps)
    | (BaseProps & CustomOptionsProps);

  export let id: string;
  export let label: string;
  export let value: string = undefined;
  export let noResultsText: string;
  export let disabled: boolean = false;
  export let labelHidden: boolean = false;
  export let options: (T | string)[];
  export let placeholder: string = null;
  export let readonly: boolean = false;
  export let required: boolean = false;
  export let optionValueKey = null;
  export let optionLabelKey = null;

  let displayValue: string;
  let listElement: HTMLUListElement;
  let inputElement: HTMLInputElement;
  let open = false;

  $: {
    const selectedOption = options.find((option) => {
      if (isString(option)) {
        return option === value;
      } else {
        return option[optionValueKey] === value;
      }
    });

    if (selectedOption === undefined) {
      displayValue = '';
    } else if (isString(selectedOption)) {
      displayValue = selectedOption;
    } else {
      displayValue = selectedOption[optionLabelKey ?? optionValueKey];
    }
  }

  export const openList = (focusList: boolean = false) => {
    open = true;
    if (focusList) {
      requestAnimationFrame(() => {
        focusFirstOption();
      });
    }
  };

  export const closeList = () => {
    if (!open) return;
    open = false;
    requestAnimationFrame(() => {
      inputElement.focus();
    });
  };

  const narrowOption = (option: unknown): T => option as T;

  $: list = options;

  const isString = (option: unknown): option is string => {
    return typeof option === 'string';
  };

  const handleSelectOption = (event: CustomEvent<string>) => {
    value = event.detail;
    closeList();
  };

  const focusFirstOption = () => {
    const listItemElement: HTMLLIElement = listElement.querySelector(
      'li[role="option"]:not([aria-disabled="true"])',
    );

    if (listItemElement) {
      listItemElement.focus();
    }
  };

  const focusNextOption = (element: HTMLLIElement) => {
    let nextElement = element.nextElementSibling;

    while (nextElement) {
      if (nextElement.matches(`li[role="option"]:not([aria-disabled="true"])`))
        break;
      nextElement = nextElement.nextElementSibling;
    }

    if (nextElement && nextElement instanceof HTMLLIElement) {
      nextElement.focus();
    } else {
      inputElement.focus();
    }
  };

  const focusPreviousOption = (element: HTMLLIElement) => {
    let previousElement = element.previousElementSibling;

    while (previousElement) {
      if (
        previousElement.matches(`[role="option"]:not([aria-disabled="true"])`)
      )
        break;
      previousElement = previousElement.previousElementSibling;
    }

    if (previousElement && previousElement instanceof HTMLLIElement) {
      previousElement.focus();
    } else {
      inputElement.focus();
    }
  };

  const handleInputKeydown = (event: KeyboardEvent) => {
    const focusList = true;
    switch (event.key) {
      case 'Escape':
        closeList();
        break;
      case 'ArrowDown':
        openList(focusList);
        event.preventDefault();
        break;
      case 'Enter':
        openList(focusList);
        break;
      case 'ArrowUp':
      case 'ArrowRight':
      case 'ArrowLeft':
        event.stopPropagation();
        break;
      default:
        break;
    }
  };

  const handleListKeydown = (event: ExtendedUListEvent) => {
    switch (event.key) {
      case 'Escape':
        closeList();
        break;
      case 'ArrowDown':
      case 'ArrowRight':
        focusNextOption(event.target);
        event.preventDefault();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        focusPreviousOption(event.target);
        event.preventDefault();
        break;
      default:
        break;
    }
  };

  const handleInput = (event: ExtendedInputEvent) => {
    if (!open) openList();
    list = options.filter((option) => {
      if (isString(option)) {
        return option
          .toLowerCase()
          .includes(event.currentTarget.value.toLowerCase());
      } else {
        return option[optionLabelKey ?? optionValueKey]
          .toLowerCase()
          .includes(event.currentTarget.value.toLowerCase());
      }
    });
  };

  const handleInputClick = () => {
    if (!open) openList();
  };
</script>

<div class="combobox">
  <label class="combobox-label" class:sr-only={labelHidden} for={id}>
    {label}
  </label>

  <div class="combobox-input-container group">
    <slot name="leading-icon" />
    <input
      {id}
      {placeholder}
      {required}
      {readonly}
      {disabled}
      value={displayValue}
      class:disabled
      class="combobox-input"
      role="combobox"
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
      aria-controls="{id}-listbox"
      aria-expanded={open}
      aria-required={required}
      aria-autocomplete="list"
      on:input={handleInput}
      on:keydown={handleInputKeydown}
      on:click={handleInputClick}
      bind:this={inputElement}
    />
    <slot name="trailing-icon">
      <Icon name={open ? 'chevron-up' : 'chevron-down'} />
    </slot>
  </div>

  <ul
    class="combobox-list {open ? 'flex' : 'hidden'}"
    id="{id}-listbox"
    role="listbox"
    bind:this={listElement}
    on:keydown={handleListKeydown}
    use:clickOutside
    on:click-outside={closeList}
  >
    {#each list as option}
      {#if typeof option === 'string'}
        <ComboboxOption
          on:select={handleSelectOption}
          value={option}
          selected={value === option}
        >
          {option}
        </ComboboxOption>
      {:else}
        <slot option={narrowOption(option)} />
      {/if}
    {:else}
      <ComboboxOption disabled>{noResultsText}</ComboboxOption>
    {/each}
  </ul>
</div>

<style lang="postcss">
  .combobox {
    @apply relative w-full;
  }

  .combobox-label {
    @apply font-secondary text-sm font-normal;
  }

  .combobox-input-container {
    @apply flex flex-row items-center px-2 h-10 gap-2 bg-white border border-primary rounded-lg focus-within:border-indigo-600 focus-within:shadow-focus focus-within:shadow-blue-600/50;
  }

  .combobox-input {
    @apply w-full h-full rounded font-primary focus:outline-none;
  }

  .combobox-list {
    @apply absolute w-full mt-1 bg-white border border-primary rounded-lg flex-col gap-2 p-2;

    :global(.combobox-option) {
      @apply cursor-pointer font-primary h-12 px-2 py-3 font-medium first:rounded-t last:rounded-b flex flex-row items-center gap-2 rounded hover:bg-indigo-50 focus:outline-none focus:border focus:bg-indigo-50 focus:border-indigo-600 focus:shadow-focus focus:shadow-blue-600/50;
    }

    :global(.combobox-option.disabled) {
      @apply text-gray-500 pointer-events-none;
    }
  }
</style>
