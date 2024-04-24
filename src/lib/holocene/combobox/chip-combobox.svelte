<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  import { translate } from '$lib/i18n/translate';

  import Button from '../button.svelte';
  import type { IconName } from '../icon';
  import ChipInput from '../input/chip-input.svelte';

  import Combobox from './combobox.svelte';

  type T = $$Generic;

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
    error?: string;
    valid?: boolean;
    chips?: string[];
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

  export let id: string;
  export let label: string;
  export let value: string = undefined;
  export let toggleLabel: string;
  export let noResultsText: string;
  export let disabled = false;
  export let labelHidden = false;
  export let options: string[];
  export let placeholder: string = null;
  export let readonly = false;
  export let required = false;
  export let leadingIcon: IconName = null;
  export let minSize = 0;
  export let maxSize = 120;
  export let error = '';
  export let valid = true;
  export let chips: string[] = [];

  let stagedChips = [];
  const handleInput = (list: string[]) => {
    if (list.length === 1) {
      stagedChips = list;
      addChips();
    } else {
      stagedChips = list;
    }
  };

  const addChips = () => {
    chips = [...new Set([...stagedChips, ...chips])];
    stagedChips = [];
  };

  const addAll = () => {
    chips = [...options];
    stagedChips = [];
  };

  const clearChips = () => {
    chips = [];
    stagedChips = [];
  };
</script>

<div class="]] flex flex-col gap-2">
  <div class="flex items-end gap-2">
    <div class="grow">
      <Combobox
        class="w-full"
        {required}
        {label}
        {labelHidden}
        {toggleLabel}
        {noResultsText}
        {value}
        {id}
        {leadingIcon}
        {options}
        {placeholder}
        on:change
        {maxSize}
        {minSize}
        {error}
        {valid}
        {readonly}
        {disabled}
        onFilter={handleInput}
      />
    </div>
    <div class="flex items-center gap-2 pb-0.5">
      <Button size="sm" on:click={addChips}>Add</Button>
      <Button size="sm" on:click={addAll}>All</Button>
      <Button size="sm" on:click={clearChips}>Clear</Button>
    </div>
  </div>
  {#key chips}
    <ChipInput
      id={id + '-chips'}
      {chips}
      {label}
      disabled
      labelHidden
      removeChipButtonLabel={translate('common.remove')}
    />
  {/key}
</div>
