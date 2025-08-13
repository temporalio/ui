<script lang="ts" context="module">
  export interface OptionType<T> {
    label: string;
    value: T;
    description?: string;
    disabled?: boolean;
    class?: string;
    'data-testid'?: string;
  }

  export const EMPTY_OPTION: OptionType<string> = {
    label: '',
    value: '',
  };
</script>

<script lang="ts">
  import {
    createEventDispatcher,
    getContext,
    onDestroy,
    onMount,
  } from 'svelte';

  import { MenuItem } from '$lib/holocene/menu';

  import { SELECT_CONTEXT, type SelectContext } from './select.svelte';

  type T = $$Generic;

  const { selectValue, handleChange, options } =
    getContext<SelectContext<T>>(SELECT_CONTEXT);

  const dispatch = createEventDispatcher<{ click: { value: T } }>();

  export let value: T;
  export let description = '';
  export let disabled = false;
  let className = '';
  export { className as class };

  let selected = false;
  let _value: T | string;
  let slotWrapper: HTMLSpanElement;
  let optionElement: HTMLLIElement;
  let label: string;

  $: {
    if (slotWrapper) {
      _value = value ?? slotWrapper.textContent;
      selected = $selectValue === _value;
      label = slotWrapper.textContent;
    }
  }

  onMount(() => {
    if (slotWrapper) {
      $options.push({ value, label, nativeElement: optionElement });
    }
  });

  onDestroy(() => {
    // Remove options from the optionContext if it no longer exists
    let theIndex = $options.findIndex((option) => option.value === value);
    if (theIndex !== undefined) {
      $options.splice(theIndex, 1);
    }
  });

  const handleOptionClick = () => {
    handleChange(_value as T);
    dispatch('click', { value: _value as T });
  };
</script>

<MenuItem
  on:click={handleOptionClick}
  role="option"
  {selected}
  {description}
  {disabled}
  class={className}
  data-testid={$$restProps['data-testid'] ?? ''}
>
  <slot name="leading" slot="leading" />
  <span bind:this={slotWrapper}>
    <slot />
  </span>
  <slot name="trailing" slot="trailing" />
</MenuItem>
