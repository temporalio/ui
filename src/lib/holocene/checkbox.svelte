<script lang="ts" generics="T">
  import type { HTMLInputAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';

  import Label from './label.svelte';

  interface Props extends HTMLInputAttributes {
    id?: string;
    disabled?: boolean;
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
    description?: string;
    onChange?: (detail: { checked: boolean; value?: T }) => void;
    flex?: Snippet;
  }

  let {
    id = crypto.randomUUID(),
    checked = $bindable(false),
    label = '',
    labelHidden = false,
    indeterminate = false,
    disabled = false,
    value = $bindable(),
    group = $bindable(),
    valid = true,
    error = '',
    required = false,
    description = '',
    class: className = '',
    'data-testid': testId,
    onclick,
    onChange,
    flex,
    ...rest
  }: Props = $props();

  let inputElement: HTMLInputElement;
  $effect(() => {
    if (inputElement !== undefined) {
      inputElement.indeterminate = indeterminate;
    }
  });

  const displayChecked = $derived(
    group !== undefined ? group.includes(value as T) : checked,
  );

  const handleChange = (
    event: Event & {
      currentTarget: EventTarget & HTMLInputElement;
    },
  ) => {
    const { checked: isChecked } = event.currentTarget;
    if (group !== undefined) {
      if (isChecked) {
        group = [...group, value as T];
      } else {
        group = group.filter((v) => v !== value);
      }
    }

    checked = isChecked;

    onChange?.({ checked: isChecked, value });
  };

  const checkIconName = $derived(
    indeterminate
      ? ('hyphen' as const)
      : displayChecked
        ? ('checkmark' as const)
        : null,
  );

  const errorId = $derived(`${id}-error`);
  const showError = $derived(!valid && !!error);
</script>

<div
  data-testid={testId}
  onclick={(event) => {
    // applying noop handler because without it onclick handlers get forwarded
    // to this div element (in addition to the input checkbox element).
    event.stopPropagation();
  }}
  onkeypress={(event) => event.stopPropagation()}
  role="none"
>
  <Label
    data-testid={testId ? `${testId}-label` : undefined}
    class={merge(
      [
        'flex',
        'select-none',
        'items-center',
        'gap-2',
        'text-sm',
        'leading-[18px]',
        'min-h-[var(--control-height-sm)]',
        'min-w-[var(--control-height-sm)]',
        'group',
      ],
      disabled && 'cursor-not-allowed',
      labelHidden && 'justify-center',
      className,
    )}
  >
    <input
      {id}
      {value}
      type="checkbox"
      class="peer sr-only"
      data-track-name="checkbox"
      data-track-intent="toggle"
      data-track-text={label}
      aria-invalid={!valid ? 'true' : undefined}
      aria-describedby={showError ? errorId : undefined}
      {disabled}
      {required}
      {...rest}
      {onclick}
      onchange={handleChange}
      checked={displayChecked}
      bind:this={inputElement}
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
          'rounded-[0.25rem]',
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
          'transition-colors',
          'duration-fast',
          'group-hover:ring-2',
          'group-hover:ring-primary',
          'peer-focus-visible:ring-2',
          'peer-focus-visible:ring-primary',
          'peer-focus-visible:ring-offset-2',
          'peer-focus-visible:ring-offset-[rgb(var(--color-surface-primary))]',
        ],
        disabled && ['cursor-not-allowed', 'opacity-50'],
        valid ? 'border-primary' : 'border-danger peer-checked:border-danger',
      )}
    >
      {#if checkIconName}
        <Icon
          class="absolute left-0 top-0 h-4 w-4"
          name={checkIconName}
          strokeWidth={3}
        />
      {/if}
    </span>

    {#if flex}
      {@render flex()}
    {:else}
      <div>
        <span class="label" class:sr-only={labelHidden}>
          {label}
        </span>
        {#if description}
          <p class="text-xs font-normal text-secondary">{description}</p>
        {/if}
      </div>
    {/if}
  </Label>
  <span id={errorId} role="alert" class="text-xs text-danger">
    {#if showError}{error}{/if}
  </span>
</div>
