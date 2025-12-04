<script lang="ts" module>
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
  import { getContext, onDestroy, onMount } from 'svelte';

  import MenuItem, {
    type MenuItemWithoutHrefProps,
  } from '$lib/holocene/menu/menu-item.svelte';

  import { SELECT_CONTEXT, type SelectContext } from './select.svelte';

  type T = $$Generic;

  const { selectValue, handleChange, options } =
    getContext<SelectContext<T>>(SELECT_CONTEXT);

  interface Props extends Omit<MenuItemWithoutHrefProps, 'value' | 'onclick'> {
    value: T;
    onclick?: (value: T) => void;
  }

  let { value, children, onclick, ...rest }: Props = $props();

  let selected = $state(false);
  let _value: T | string = $state();
  let slotWrapper: HTMLSpanElement;
  let optionElement: HTMLLIElement;
  let label: string;

  $effect(() => {
    if (slotWrapper) {
      _value = value ?? slotWrapper.textContent;
      selected = $selectValue === _value;
      label = slotWrapper.textContent;
    }
  });

  onMount(() => {
    if (slotWrapper) {
      label = slotWrapper.textContent;
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
    onclick?.(_value as T);
  };
</script>

<MenuItem onclick={handleOptionClick} role="option" {selected} {...rest}>
  <span bind:this={slotWrapper}>
    {@render children()}
  </span>
</MenuItem>
