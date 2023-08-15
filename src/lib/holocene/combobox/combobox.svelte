<script lang="ts" generics="T extends object">
  import Icon from '../icon/icon.svelte';

  import type { IconName } from '../icon/paths';

  import { createEventDispatcher } from 'svelte';
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
    leadingIcon?: IconName;
    'data-testid'?: string;
  }

  type UncontrolledStringOptionProps = {
    options: string[];
    optionValueKey?: never;
    optionLabelKey?: never;
    renderDisplayValue?: never;
  };

  type UncontrolledCustomOptionProps = {
    options: T[];
    optionValueKey: keyof T;
    optionLabelKey?: keyof T;
  };

  type ControlledCustomOptionProps = {
    options: T[];
    renderDisplayValue: (option: T) => string;
    filter: (option: T, value: string) => boolean;
    match: (option: T, value: string) => boolean;
    optionValueKey?: never;
    optionLabelKey?: never;
  };

  type $$Props =
    | (BaseProps & UncontrolledStringOptionProps)
    | (BaseProps & UncontrolledCustomOptionProps)
    | (BaseProps & ControlledCustomOptionProps);

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
  export let leadingIcon: IconName = null;
  export let optionValueKey: keyof T = null;
  export let optionLabelKey: keyof T = optionValueKey;
  export let renderDisplayValue: (option: T) => string = () => '';
  export let filter: (option: T, value: string) => boolean = () => false;
  export let match: (option: T, value: string) => boolean = () => false;

  let displayValue: string;
  let selectedOption: string | T;
  let menuElement: HTMLUListElement;
  const open = writable<boolean>(false);
  $: list = options;

  $: {
    selectedOption = options.find((option) => {
      if (isStringOption(option)) {
        return option === value;
      }

      if (isObjectOption(option)) {
        if (canRenderCustomOption(option)) {
          return option[optionValueKey] === value;
        }

        return match(option, value);
      }
    });

    displayValue = getDisplayValue(selectedOption);
  }

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

  const isObjectOption = (option: string | T): option is T => {
    return typeof option === 'object';
  };

  const canRenderCustomOption = (option: T) => {
    return (
      optionValueKey !== null &&
      optionLabelKey !== null &&
      optionValueKey in option &&
      optionValueKey in option
    );
  };

  const getDisplayValue = (option: string | T): string => {
    if (isStringOption(option)) {
      return option;
    }

    if (isObjectOption(option)) {
      if (canRenderCustomOption(option)) {
        return option[optionLabelKey];
      } else {
        return renderDisplayValue(option);
      }
    }
  };

  const setValue = (option: string | T): void => {
    if (isStringOption(option)) {
      value = option;
    }

    if (isObjectOption(option) && canRenderCustomOption(option)) {
      value = option[optionValueKey];
    }
  };

  const handleSelectOption = (option: string | T) => {
    dispatch('change', option);
    setValue(option);
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
    if (!$open) openList();

    list = options.filter((option) => {
      if (isStringOption(option)) {
        return option
          .toLowerCase()
          .includes(event.currentTarget.value.toLowerCase());
      }

      if (isObjectOption(option)) {
        if (canRenderCustomOption(option)) {
          return String(option[optionLabelKey])
            .toLowerCase()
            .includes(event.currentTarget.value.toLowerCase());
        }

        return filter(option, event.currentTarget.value);
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
    <svelte:fragment slot="leading">
      {#if leadingIcon}
        <Icon name={leadingIcon} />
      {/if}
    </svelte:fragment>
    <input
      {id}
      {placeholder}
      {required}
      {readonly}
      {disabled}
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
      {...$$restProps}
    />
  </MenuButton>

  <Menu bind:menuElement id="{id}-listbox" role="listbox">
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
    @apply w-full h-full flex content-center font-primary focus:outline-none focus:border-indigo-600;
  }
</style>
