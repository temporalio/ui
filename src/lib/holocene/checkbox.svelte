<script lang="ts">
  
  import type { HTMLInputAttributes } from 'svelte/elements';
  
  import { createEventDispatcher } from 'svelte';
  
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { omit } from '$lib/utilities/omit';

  type T = $$Generic;

  interface $$Props extends HTMLInputAttributes {
    checked?: boolean;
    label?: string;
    onDark?: boolean;
    indeterminate?: boolean;
    hoverable?: boolean;
    value?: T;
    group?: T[];
    'data-testid'?: string;
  }

  export let id = '';
  export let checked = false;
  export let label = '';
  export let onDark = false;
  export let indeterminate = false;
  export let disabled = false;
  export let hoverable = false;
  export let value: T = undefined;
  export let group: T[] = undefined;

  const dispatch = createEventDispatcher<{
    change: { checked: boolean; value?: T };
  }>();

  const handleChange = (
    event: Event & {
      currentTarget: EventTarget & HTMLInputElement;
    },
  ) => {
    const { checked: isChecked } = event.currentTarget;
    if (group !== undefined) {
      if (isChecked) {
        group = [...group, value];
      } else {
        group = group.filter((v) => v !== value);
      }
    }

    checked = isChecked;

    dispatch('change', { checked: event.currentTarget.checked, value });
  };

  $: checked = group !== undefined ? group.includes(value) : checked;
</script>

<div
  data-testid={$$restProps['data-testid'] ?? null}
  on:click|stopPropagation
  on:keypress|stopPropagation
  class="relative {$$props.class}"
>
  <label
    on:click
    on:keypress
    class="checkbox"
    class:hoverable
    class:disabled
    class:on-dark={onDark}
  >
    {#if label}
      <span class="label" class:hoverable>
        {label}
      </span>
    {/if}
    <input
      on:click|stopPropagation
      on:change={handleChange}
      {id}
      {value}
      type="checkbox"
      bind:checked
      {indeterminate}
      {disabled}
      class:indeterminate
      {...omit($$restProps, 'data-testid')}
    />
    <span class="checkmark" class:hoverable class:on-dark={onDark}>
      {#if indeterminate}
        <Icon class="absolute top-0 left-0 h-4 w-4" name="hyphen" />
      {:else if checked}
        <Icon
          class="absolute top-0 left-0 h-4 w-4"
          name="checkmark"
          strokeWidth={3}
        />
      {/if}
    </span>
  </label>
</div>

<style lang="postcss">
  .checkbox {
    @apply block h-[18px] w-[18px] cursor-pointer select-none text-sm leading-[18px] text-primary;
  }

  .checkbox.hoverable {
    @apply h-9 w-9 rounded-full hover:bg-purple-200;
  }

  .checkbox.on-dark {
    @apply text-white;
  }

  .label {
    @apply ml-6 flex h-full items-center whitespace-nowrap;
  }

  .label.hoverable {
    @apply ml-10;
  }

  input {
    @apply absolute top-0 left-0 h-0 w-0 opacity-0;
  }

  .checkmark {
    @apply absolute top-0 left-0 box-content h-4 w-4 cursor-pointer rounded-sm border border-gray-500 bg-white;
  }

  .checkmark.hoverable {
    @apply translate-x-1/2 translate-y-1/2;
  }

  .checkmark.on-dark {
    @apply border-white bg-primary;
  }

  input:checked + .checkmark,
  input.indeterminate + .checkmark {
    @apply bg-primary text-white;
  }

  input:focus-visible + .checkmark {
    @apply outline outline-blue-700;
  }

  .checkbox.disabled,
  .checkbox.disabled .checkmark {
    @apply cursor-default;
  }

  .checkbox.disabled.on-dark {
    @apply text-opacity-80;
  }

  .checkbox.disabled:not(.on-dark) .checkmark {
    @apply bg-gray-300;
  }

  .checkbox.disabled.on-dark .checkmark {
    @apply border-opacity-80 text-opacity-80;
  }
</style>
