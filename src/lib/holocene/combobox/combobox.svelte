<script lang="ts" generics="T extends object">
  import { writable } from 'svelte/store';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import MenuContainer from '$lib/holocene/menu/menu-container.svelte';
  import Menu from '$lib/holocene/menu/menu.svelte';
  import ComboboxOption from '$lib/holocene/combobox/combobox-option.svelte';
  import MenuButton from '../menu/menu-button.svelte';

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
  let menuElement: HTMLUListElement;
  const open = writable<boolean>(false);
  $: list = options;

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

  export const openList = () => {
    $open = true;
  };

  export const closeList = () => {
    if (!$open) return;
    $open = false;
  };

  const narrowOption = (option: unknown): T => option as T;

  const isString = (option: unknown): option is string => {
    return typeof option === 'string';
  };

  const handleSelectOption = (option: string | T) => {
    value = isString(option) ? option : option[optionValueKey];
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
        return option[optionLabelKey ?? optionValueKey]
          .toLowerCase()
          .includes(event.currentTarget.value.toLowerCase());
      }
    });
  };

  const handleInputClick = () => {
    if (!$open) openList();
  };
</script>

<MenuContainer {open}>
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
      value={displayValue}
      class:disabled
      class="combobox-input"
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
      {#if typeof option === 'string'}
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
    @apply w-full h-full flex content-center rounded font-primary focus:outline-none;
  }
</style>
