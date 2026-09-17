<script lang="ts" generics="T">
  import type { HTMLInputAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { IconCheckmark, IconHyphen } from '$lib/io/icon';

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

  const CheckIcon = $derived(
    indeterminate ? IconHyphen : displayChecked ? IconCheckmark : null,
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
        'gap-3',
        'text-sm',
        'leading-5',
        'min-h-6',
        'min-w-6',
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
        'checkbox-control',
        [
          'relative',
          'rounded-sm',
          'box-border',
          'flex',
          'h-5',
          'w-5',
          'flex-none',
          'cursor-pointer',
          'border',
          'border-secondary',
          'bg-background-primary',
          'text-inverse-primary',
          'peer-indeterminate:border-interactive-primary',
          'peer-indeterminate:bg-interactive-primary',
          'peer-checked:border-interactive-primary',
          'peer-checked:bg-interactive-primary',
        ],
        !disabled &&
          valid && [
            'peer-focus-visible:ring-2',
            'peer-focus-visible:ring-interactive-primary',
            'peer-focus-visible:ring-offset-2',
            'peer-focus-visible:ring-offset-background-primary',
            'peer-focus-visible:shadow-sm',
          ],
        !disabled &&
          valid && [
            'group-hover:border-tertiary',
            'peer-focus-visible:border-tertiary',
            'group-hover:peer-checked:border-interactive-primary',
            'group-hover:peer-indeterminate:border-interactive-primary',
          ],
        disabled && ['cursor-not-allowed', 'opacity-50'],
        !valid &&
          'border-danger peer-checked:border-danger peer-indeterminate:border-danger peer-focus-visible:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-danger peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background-primary',
      )}
    >
      {#if CheckIcon}
        <CheckIcon class="absolute inset-0 m-auto h-4 w-4" />
      {/if}
    </span>

    {#if flex}
      {@render flex()}
    {:else}
      <div>
        <span class:sr-only={labelHidden}>
          {label}
          {#if required}
            <span
              aria-hidden="true"
              class="ml-1 font-mono leading-none text-static-danger">*</span
            >
          {/if}
        </span>
        {#if description}
          <p class="text-sm font-normal text-secondary">
            {description}
          </p>
        {/if}
      </div>
    {/if}
  </Label>
  <span id={errorId} role="alert" class="text-xs text-danger">
    {#if showError}{error}{/if}
  </span>
</div>

<style lang="postcss">
  .peer:not([aria-invalid='true']):checked:focus-visible + .checkbox-control,
  .peer:not([aria-invalid='true']):indeterminate:focus-visible
    + .checkbox-control {
    @apply border-interactive-primary;
  }
</style>
