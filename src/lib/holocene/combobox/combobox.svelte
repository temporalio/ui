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

  type ExtendedUListEvent = KeyboardEvent & {
    currentTarget: EventTarget & HTMLUListElement;
    target: HTMLLIElement;
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
  let inputElement: HTMLInputElement;
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

  export const openList = (focusList: boolean = false) => {
    $open = true;
    if (focusList) {
      requestAnimationFrame(() => {
        focusFirstOption();
      });
    }
  };

  export const closeList = () => {
    if (!$open) return;
    $open = false;
    requestAnimationFrame(() => {
      inputElement.focus();
    });
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

  <MenuButton
    aria-hidden="true"
    tabindex={-1}
    hasIndicator
    {disabled}
    controls="{id}-listbox"
  >
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
      on:input={handleInput}
      on:keydown={handleInputKeydown}
      on:click|stopPropagation={handleInputClick}
      bind:this={inputElement}
      data-testid={$$props['data-testid'] ?? id}
      {...$$restProps}
    />
    <slot name="trailing" slot="trailing" />
  </MenuButton>

  <Menu
    bind:menuElement
    on:keydown={handleListKeydown}
    id="{id}-listbox"
    role="listbox"
  >
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
