<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  import { createEventDispatcher } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import { omit } from '$lib/utilities/omit';

  import Label from './label.svelte';

  type T = $$Generic;

  interface $$Props extends HTMLInputAttributes {
    checked?: boolean;
    label?: string;
    labelHidden?: boolean;
    indeterminate?: boolean;
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
  role="none"
>
  <Label
    class={merge(
      [
        'flex',
        'select-none',
        'items-center',
        'gap-3',
        'text-sm',
        'leading-[18px]',
        'group',
      ],
      disabled && 'cursor-not-allowed',
      className,
    )}
  >
    <input
      on:click
      on:change={handleChange}
      {id}
      {value}
      type="checkbox"
      class="peer sr-only"
      bind:checked
      {disabled}
      {required}
      bind:this={inputElement}
      {...omit($$restProps, 'data-testid')}
    />

    <span
      class={merge(
        [
          'relative',
          'box-content',
          'flex',
          'h-4',
          'w-4',
          'flex-none',
          'cursor-pointer',
          'rounded-md',
          'border',
          'bg-primary',
          'text-inverse',
          'bg-clip-padding',
          'peer-indeterminate:bg-interactive',
          'peer-indeterminate:border-interactive',
          'peer-checked:bg-interactive',
          'peer-checked:border-interactive',
        ],
        !disabled && [
          'group-hover:border-inverse',
          'peer-focus-visible:border-inverse',
          'group-hover:peer-checked:border-inverse',
          'group-hover:peer-indeterminate:border-inverse',
          'group-hover:bg-interactive-active',
          'peer-focus-visible:bg-interactive-active',
          'group-hover:peer-checked:bg-interactive-active',
          'group-hover:peer-indeterminate:bg-interactive-active',
          'group-hover:ring-4',
          'group-hover:ring-primary/70',
          'peer-focus-visible:ring-4',
          'peer-focus-visible:ring-primary/70',
        ],
        disabled && ['cursor-not-allowed', 'opacity-50'],
        valid ? 'border-secondary' : 'border-danger peer-checked:border-danger',
      )}
    >
      {#if indeterminate || checked}
        <Icon
          class="absolute left-0 top-0 h-4 w-4"
          name={indeterminate ? 'hyphen' : checked ? 'checkmark' : null}
          strokeWidth={3}
        />
      {/if}
    </span>

    <slot name="flex">
      <span class="label" class:sr-only={labelHidden}>
        {label}
      </span>
    </slot>
  </Label>
  {#if !valid && error}
    <span class="text-xs text-danger">{error}</span>
  {/if}
</div>
