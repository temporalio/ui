<script lang="ts" context="module">
  export interface OptionType<T> {
    label: string;
    value: T;
    description?: string;
  }

  export const EMPTY_OPTION: OptionType<string> = {
    label: '',
    value: '',
  };
</script>

<script lang="ts">
  import { getContext, onDestroy, onMount } from 'svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import type { Writable } from 'svelte/store';
  import type { SelectContext, SelectOption } from './select.svelte';

  const parentSelectValues =
    getContext<Writable<SelectContext<T>>>('select-value');
  const selectOnChange =
    getContext<(params: SelectOption<T>) => void>('select-change');
  const optionContext =
    getContext<Writable<SelectOption<T>[]>>('select-options');

  type T = $$Generic;

  export let value: T | undefined = undefined;
  export let description: string = '';
  export let dark: boolean = false;

  let selected: boolean = false;
  let _value: any;
  let slotWrapper: HTMLSpanElement;
  let label: string;

  $: {
    if (slotWrapper) {
      _value = value ?? slotWrapper.textContent;
      selected = $parentSelectValues.value === _value;
      label = slotWrapper.textContent;
    }
  }

  onMount(() => {
    if (slotWrapper) {
      label = slotWrapper.textContent;
      $optionContext.push({ value, label });
    }
  });

  onDestroy(() => {
    // Remove options from the optionContext if it no longer exists
    let theIndex = $optionContext.findIndex((option) => option.value === value);
    if (theIndex !== undefined) {
      $optionContext.splice(theIndex, 1);
    }
  });

  const handleOptionClick = () => {
    selectOnChange(_value);
  };
</script>

<MenuItem
  class="flex flex-row items-start"
  on:click={handleOptionClick}
  {selected}
  {dark}
>
  <div class="mr-2 w-6">
    {#if selected}
      <Icon name="checkmark" />
    {/if}
  </div>
  <div class="flex w-full flex-col">
    <span bind:this={slotWrapper} class="option-label">
      <slot />
    </span>
    {#if description}
      <span class="option-description">
        {description}
      </span>
    {/if}
  </div>
</MenuItem>

<style lang="postcss">
  .option-label {
    @apply flex whitespace-nowrap font-secondary text-sm font-medium;
  }

  .option-description {
    @apply flex font-primary text-sm font-normal;
  }
</style>
