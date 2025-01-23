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
  import { getContext, onDestroy, onMount, type Snippet } from 'svelte';

  import { MenuItem } from '$lib/holocene/menu';

  import { SELECT_CONTEXT, type SelectContext } from './select.svelte';

  type T = $$Generic;

  const { selectValue, handleChange, options } =
    getContext<SelectContext<T>>(SELECT_CONTEXT);

  interface Props {
    value: T;
    description?: string;
    disabled?: boolean;
    class?: string;
    leading?: Snippet;
    trailing?: Snippet;
    children?: Snippet;
    click?: (e: { value: T }) => void;
  }

  let {
    value,
    description = '',
    disabled = false,
    class: className = '',
    leading: leading_render,
    trailing: trailing_render,
    children,
    click = () => {},
    ...rest
  }: Props = $props();

  let selected = $state(false);
  let _value: T | string = $state();
  let slotWrapper: HTMLSpanElement = $state();
  let optionElement: HTMLLIElement = $state();
  let label: string = $state();

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
    click({ value: _value as T });
  };
</script>

<MenuItem
  onclick={handleOptionClick}
  role="option"
  {selected}
  {description}
  {disabled}
  class={className}
  data-testid={rest['data-testid'] ?? ''}
>
  {#snippet leading()}
    {@render leading_render?.()}
  {/snippet}
  <span bind:this={slotWrapper}>
    {@render children?.()}
  </span>
  {#snippet trailing()}
    {@render trailing_render?.()}
  {/snippet}
</MenuItem>
