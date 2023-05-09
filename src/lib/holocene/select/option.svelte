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
  import {
    getContext,
    onDestroy,
    onMount,
    createEventDispatcher,
  } from 'svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { type SelectContext, SELECT_CONTEXT } from './select.svelte';

  type T = $$Generic;

  const { selectValue, handleChange, options, open } =
    getContext<SelectContext<T>>(SELECT_CONTEXT);

  const dispatch = createEventDispatcher<{ click: { value: T } }>();

  export let value: T;
  export let description: string = '';

  let selected: boolean = false;
  let _value: any;
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
    handleChange(_value);
    dispatch('click', { value: _value });
  };

  const handleOptionKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && $open) {
      $open = false;
      return;
    }

    if (!$open) {
      return;
    } else if (event.key === 'Enter' || event.key === ' ') {
      handleOptionClick();
    } else if (event.key === 'ArrowDown') {
      const currentIdx = $options.findIndex((option) => option.value === value);
      if (currentIdx !== undefined && currentIdx < $options.length - 1) {
        $options[currentIdx + 1].nativeElement.focus();
      }
    } else if (event.key === 'ArrowUp') {
      const currentIdx = $options.findIndex((option) => option.value === value);
      if (currentIdx !== undefined && currentIdx && currentIdx > 0) {
        $options[currentIdx - 1].nativeElement.focus();
      }
    }
  };
</script>

<li
  role="option"
  aria-selected={selected}
  tabindex={0}
  class="select-option"
  class:selected
  bind:this={optionElement}
  on:click|stopPropagation={handleOptionClick}
  on:keydown|stopPropagation|preventDefault={handleOptionKeydown}
>
  <div class="mr-2 w-6">
    {#if selected}
      <Icon name="checkmark" />
    {/if}
  </div>
  <div class="flex grow flex-col">
    <span bind:this={slotWrapper} class="option-label">
      <slot />
    </span>
    {#if description}
      <span class="option-description">
        {description}
      </span>
    {/if}
  </div>
</li>

<style lang="postcss">
  .select-option:first-of-type {
    @apply rounded-t;
  }

  .select-option:last-of-type {
    @apply rounded-b;
  }

  .select-option {
    @apply rounded flex flex-row items-start justify-center cursor-pointer list-none bg-white p-4 font-secondary text-sm font-medium text-primary hover:bg-gray-50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-700 focus-visible:bg-blue-50;
  }

  .select-option.selected {
    @apply text-blue-700;
  }

  .option-label {
    @apply flex whitespace-nowrap font-secondary text-sm font-medium leading-6;
  }

  .option-description {
    @apply flex font-primary text-sm font-normal;
  }
</style>
