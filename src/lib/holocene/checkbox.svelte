<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  import { createEventDispatcher } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import { omit } from '$lib/utilities/omit';

  type T = $$Generic;

  interface $$Props extends HTMLInputAttributes {
    checked?: boolean;
    label?: string;
    labelHidden?: boolean;
    indeterminate?: boolean;
    hoverable?: boolean;
    value?: T;
    group?: T[];
    'data-testid'?: string;
    required?: boolean;
    valid?: boolean;
    error?: string;
  }

  export let id = '';
  export let checked = false;
  export let label = '';
  export let labelHidden = false;
  export let indeterminate = false;
  export let disabled = false;
  export let hoverable = false;
  export let value: T = undefined;
  export let group: T[] = undefined;
  export let valid = true;
  export let error = '';
  export let required = false;
  let className = '';
  export { className as class };

  let inputElement: HTMLInputElement;
  $: inputElement !== undefined && (inputElement.indeterminate = indeterminate);

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
  role="checkbox"
  aria-checked={checked}
  tabindex={-1}
>
  <label
    class={merge('checkbox', 'text-primary', className)}
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
      {disabled}
      {required}
      class:indeterminate
      bind:this={inputElement}
      {...omit($$restProps, 'data-testid')}
    />

    <span class="checkmark" class:disabled class:invalid={!valid}>
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
  {#if !valid && error}
    <span class="error">{error}</span>
  {/if}
</div>

<style lang="postcss">
  .checkbox {
    @apply flex cursor-pointer select-none items-center gap-3 text-sm leading-[18px] text-primary;

    &.disabled {
      @apply cursor-not-allowed;
    }
  }

  .label {
    @apply flex;
  }

  input {
    @apply sr-only;
  }

  .checkmark {
    @apply relative box-content flex h-4 w-4 flex-none cursor-pointer rounded-md border-2 border-subtle bg-transparent text-white outline outline-4 outline-transparent dark:text-black;

    &.invalid {
      @apply border-error;
    }

    &.disabled {
      @apply cursor-not-allowed opacity-50;
    }
  }

  input:checked ~ .checkmark {
    @apply border-interactive bg-interactive;

    &.invalid {
      @apply border-error;
    }
  }

  .checkbox.hoverable {
    &:hover {
      input:enabled ~ .checkmark {
        @apply border-white bg-interactive outline-offset-0 outline-interactive/70 dark:border-black;
      }
    }
  }

  input:focus-visible ~ .checkmark {
    @apply border-white bg-interactive outline-offset-0 outline-interactive/70 dark:border-black;
  }

  .error {
    @apply text-xs text-danger;
  }
</style>
