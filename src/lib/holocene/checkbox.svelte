<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  import { createEventDispatcher } from 'svelte';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import { omit } from '$lib/utilities/omit';

  type T = $$Generic;

  interface $$Props extends HTMLInputAttributes {
    checked?: boolean;
    label?: string;
    labelHidden?: boolean;
    theme?: 'dark' | 'light';
    indeterminate?: boolean;
    hoverable?: boolean;
    value?: T;
    group?: T[];
    'data-testid'?: string;
  }

  export let id = '';
  export let checked = false;
  export let label = '';
  export let labelHidden = false;
  export let theme: 'dark' | 'light' = 'light';
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
    class="checkbox {theme}"
    class:hoverable={hoverable && !disabled}
    class:disabled
  >
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

    <span class="checkmark {theme}" class:disabled>
      {#if indeterminate}
        <Icon class="absolute left-0 top-0 h-4 w-4" name="hyphen" />
      {:else if checked}
        <Icon
          class="absolute left-0 top-0 h-4 w-4"
          name="checkmark"
          strokeWidth={3}
        />
      {/if}
    </span>

    <slot name="label">
      <span class="label" class:sr-only={labelHidden}>
        {label}
      </span>
    </slot>
  </label>
</div>

<style lang="postcss">
  .checkbox {
    @apply flex cursor-pointer select-none items-start gap-3 text-sm leading-[18px];
  }

  .checkbox.hoverable:hover .checkmark::before {
    @apply absolute -left-2.5 -z-10 h-9 w-9 self-center rounded-full content-[''];
  }

  .label {
    @apply flex;
  }

  input {
    @apply sr-only;
  }

  .checkmark {
    @apply relative box-content flex h-4 w-4 flex-none cursor-pointer rounded-sm border;
  }

  .disabled {
    @apply cursor-default;
  }

  /** Light Theme Styles */
  .checkbox.light {
    @apply text-primary;
  }

  .checkbox.hoverable.light:hover .checkmark::before {
    @apply bg-purple-200;
  }

  .checkmark.light {
    @apply surface-primary border-primary;
  }

  input:focus-visible ~ .checkmark.light {
    @apply outline outline-blue-700;
  }

  .checkmark.disabled.light {
    @apply bg-slate-300;
  }

  /** Dark Theme Styles */

  .checkbox.dark {
    @apply text-white;
  }

  .checkmark.dark {
    @apply border-white;
  }

  .checkbox.hoverable.dark:hover .checkmark::before {
    @apply bg-slate-700;
  }

  input:focus-visible ~ .checkmark.dark {
    @apply outline outline-indigo-600;
  }

  .checkbox.disabled.dark {
    @apply text-opacity-80;
  }

  .checkmark.disabled.dark {
    @apply border-opacity-80 text-opacity-80;
  }
</style>
