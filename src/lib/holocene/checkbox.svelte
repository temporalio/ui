<script lang="ts" module>
  export type ChangeEvent<T = undefined> = {
    checked: boolean;
    value?: T;
  };
</script>

<script lang="ts" generics="T">
  import type { HTMLInputAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import { omit } from '$lib/utilities/omit';

  import Label from './label.svelte';

  type $$Props = Omit<HTMLInputAttributes, 'onchange'> & {
    checked?: boolean;
    label?: string | Snippet;
    labelHidden?: boolean;
    indeterminate?: boolean;
    value?: T;
    group?: T[];
    'data-testid'?: string;
    required?: boolean;
    valid?: boolean;
    error?: string;
    onchange?: (changeEvent: ChangeEvent<T>) => void;
    class?: string;
  };

  let {
    id = '',
    checked = $bindable(false),
    label = '',
    labelHidden = false,
    indeterminate = false,
    disabled = false,
    value = undefined,
    group = $bindable(undefined),
    valid = true,
    error = '',
    required = false,
    onchange = () => {},
    'data-testid': testId = null,
    class: className = '',
    ...rest
  }: $$Props = $props();

  let inputElement: HTMLInputElement | undefined = $state();

  $effect(() => {
    if (inputElement) {
      inputElement.indeterminate = indeterminate;
    }
  });

  $effect(() => {
    checked = group !== undefined ? group.includes(value) : checked;
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

  const stopPropagation = (event: Event) => {
    event.stopPropagation();
  };
</script>

<div
  data-testid={testId}
  onclick={stopPropagation}
  onkeypress={stopPropagation}
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
      {...omit(rest, 'data-testid')}
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
          strokeWidth="3"
        />
      {/if}
    </span>

    {#if label}
      {#if typeof label === 'string'}
        <span class="label" class:sr-only={labelHidden}>
          {label}
        </span>
      {:else}
        {@render label()}
      {/if}
    {/if}
  </Label>
  {#if !valid && error}
    <span class="text-xs text-danger">{error}</span>
  {/if}
</div>
