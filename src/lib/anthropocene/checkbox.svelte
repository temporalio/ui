<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/anthropocene/icon/icon.svelte';
  import { omit } from '$lib/utilities/omit';

  import Label from './label.svelte';

  type T = $$Generic;

  interface Props extends HTMLInputAttributes {
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
    class?: string;
    onchange?: (event: { checked: boolean; value?: T }) => void;
    flex?: Snippet;
  }

  let {
    id = '',
    checked = $bindable(false),
    label = '',
    labelHidden = false,
    indeterminate = false,
    disabled = false,
    value,
    group = $bindable(),
    valid = true,
    error = '',
    required = false,
    class: className = '',
    onchange,
    flex,
    ...restProps
  }: Props = $props();

  let inputElement: HTMLInputElement;

  $effect(() => {
    if (inputElement !== undefined) {
      inputElement.indeterminate = indeterminate;
    }
  });

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

    onchange?.({ checked: event.currentTarget.checked, value });
  };

  $effect(() => {
    checked = group !== undefined ? group.includes(value) : checked;
  });
</script>

<div
  data-testid={restProps['data-testid'] ?? null}
  onclick={(e) => e.stopPropagation()}
  onkeypress={(e) => e.stopPropagation()}
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
      onchange={handleChange}
      {id}
      {value}
      type="checkbox"
      class="peer sr-only"
      bind:checked
      {disabled}
      {required}
      bind:this={inputElement}
      {...omit(restProps, 'data-testid')}
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
          'group-hover:ring-2',
          'group-hover:ring-primary/70',
          'peer-focus-visible:ring-2',
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

    {#if flex}
      {@render flex()}
    {:else}
      <span class="label" class:sr-only={labelHidden}>
        {label}
      </span>
    {/if}
  </Label>
  {#if !valid && error}
    <span class="text-xs text-danger">{error}</span>
  {/if}
</div>
