<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  import { createEventDispatcher } from 'svelte';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import { omit } from '$lib/utilities/omit';

  type T = $$Generic;

  interface $$Props extends HTMLInputAttributes {
    checked?: boolean;
    label: string;
    labelHidden?: boolean;
    onDark?: boolean;
    indeterminate?: boolean;
    hoverable?: boolean;
    value?: T;
    group?: T[];
    'data-testid'?: string;
  }

  export let id = '';
  export let checked = false;
  export let label: string;
  export let labelHidden = false;
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
  class={$$props.class}
>
  <label
    on:click
    on:keypress
    class="checkbox"
    class:hoverable
    class:disabled
    class:on-dark={onDark}
  >
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

    <span class="label" class:hoverable class:sr-only={labelHidden}>
      {label}
    </span>

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
  </label>
</div>

<style lang="postcss">
  .checkbox {
    @apply flex cursor-pointer select-none items-center gap-3 text-sm leading-[18px] text-primary;
  }

  .checkbox.hoverable:hover .checkmark::before {
    @apply absolute -left-[.65rem] -z-10 h-9 w-9 self-center rounded-full bg-purple-200;

    content: ' ';
  }

  .checkbox.on-dark {
    @apply text-white;
  }

  .label {
    @apply flex;
  }

  input {
    @apply sr-only;
  }

  .checkmark {
    @apply relative box-content flex h-4 w-4 flex-none cursor-pointer rounded-sm border border-gray-500 bg-white;
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
