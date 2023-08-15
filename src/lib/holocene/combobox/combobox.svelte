<script lang="ts" generics="T extends object">
  import { onMount, createEventDispatcher } from 'svelte';
  import { writable } from 'svelte/store';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import ComboboxOption from '$lib/holocene/combobox/combobox-option.svelte';
  import MenuButton from '../menu/menu-button.svelte';

  const dispatch = createEventDispatcher<{ change: T | string }>();

  type ExtendedInputEvent = Event & {
    currentTarget: EventTarget & HTMLInputElement;
  };

  interface BaseProps extends HTMLInputAttributes {
    id: string;
    label: string;
    value: string;
    noResultsText: string;
    disabled?: boolean;
    labelHidden?: boolean;
    placeholder?: string;
    readonly?: boolean;
    required?: boolean;
    'data-testid'?: string;
  }

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

  let className = '';
  export { className as class };
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
  export let optionLabelKey = optionValueKey;

  let displayValue: string;
  let selectedOption: string | T;
  let menuElement: HTMLUListElement;
  const open = writable<boolean>(false);
  $: list = options;

  onMount(() => {
    selectedOption = options.find((option) => {
      if (isString(option)) {
        return option === value;
      } else {
        return option[optionValueKey] === value;
      }
    });

    displayValue = getDisplayValue(selectedOption);
  });

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

  const isString = (option: string | T): option is string => {
    return typeof option === 'string';
  };

  const isObject = (option: string | T): option is T => {
    return typeof option === 'object' && optionValueKey in option;
  };

  const getDisplayValue = (option: string | T): string => {
    if (isString(option)) {
      return option;
    } else if (isObject(option)) {
      return option[optionLabelKey];
    }

    return '';
  };

  const getValue = (option: string | T): string => {
    if (isString(option)) {
      return option;
    } else if (isObject(option)) {
      return option[optionValueKey];
    }

    return '';
  };

  const handleSelectOption = (option: string | T) => {
    dispatch('change', option);
    value = getValue(option);
    displayValue = getDisplayValue(option);
    closeList();
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
    if (!$open) openList();
    list = options.filter((option) => {
      if (isString(option)) {
        return option
          .toLowerCase()
          .includes(event.currentTarget.value.toLowerCase());
      } else {
        return option[optionLabelKey]
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

  <MenuButton hasIndicator {disabled} controls="{id}-listbox">
    <slot name="leading" slot="leading" />
    <input
      {id}
      {placeholder}
      {required}
      {readonly}
      {disabled}
      bind:value={displayValue}
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
      {...$$restProps}
    />
    <slot name="trailing" slot="trailing" />
  </MenuButton>

  <Menu bind:menuElement id="{id}-listbox" role="listbox">
    {#each list as option}
      {#if isObject(option)}
        <ComboboxOption
          on:click={() => handleSelectOption(option)}
          selected={value === option[optionValueKey]}
        >
          {option[optionLabelKey]}
        </ComboboxOption>
      {:else if isString(option)}
        <ComboboxOption
          on:click={() => handleSelectOption(option)}
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
  </Menu>
</MenuContainer>

<style lang="postcss">
  .combobox-label {
    @apply font-secondary text-sm font-normal;
  }

  .combobox-input {
    @apply w-full h-full flex content-center font-primary focus:outline-none focus:border-indigo-600;
  }
</style>
