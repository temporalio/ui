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
        'leading-[18px]',
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
        [
          'relative',
          'box-content',
          'flex',
          'h-4',
          'w-4',
          'flex-none',
          'cursor-pointer',
          'border',
          'border-io-border-tertiary',
          'bg-io-interactive-secondary',
          'text-io-content-inverse-primary',
          'bg-clip-padding',
          'peer-indeterminate:border-io-interactive-primary',
          'peer-indeterminate:bg-io-interactive-primary',
          'peer-checked:border-io-interactive-primary',
          'peer-checked:bg-io-interactive-primary',
        ],
        !disabled &&
          valid && [
            'peer-focus-visible:ring-2',
            'peer-focus-visible:ring-io-interactive-primary',
            'peer-focus-visible:ring-offset-2',
            'peer-focus-visible:ring-offset-io-background-primary',
          ],
        !disabled &&
          valid && [
            'group-hover:border-io-border-brand',
            'group-hover:bg-io-actions-hover-overlay',
            'group-active:bg-io-actions-press-overlay',
            'group-hover:peer-checked:border-io-interactive-primary-hover',
            'group-hover:peer-checked:bg-io-interactive-primary-hover',
            'group-active:peer-checked:border-io-interactive-primary-press',
            'group-active:peer-checked:bg-io-interactive-primary-press',
            'group-hover:peer-indeterminate:border-io-interactive-primary-hover',
            'group-hover:peer-indeterminate:bg-io-interactive-primary-hover',
            'group-active:peer-indeterminate:border-io-interactive-primary-press',
            'group-active:peer-indeterminate:bg-io-interactive-primary-press',
          ],
        disabled && ['cursor-not-allowed', 'opacity-50'],
        !valid &&
          'border-io-border-danger peer-checked:border-io-border-danger peer-indeterminate:border-io-border-danger peer-focus-visible:ring-2 peer-focus-visible:ring-io-border-danger peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-io-background-primary',
      )}
    >
      {#if CheckIcon}
        <CheckIcon class="absolute left-0 top-0 h-4 w-4" />
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
          <p class="text-xs font-normal text-io-content-secondary">
            {description}
          </p>
        {/if}
      </div>
    {/if}
  </Label>
  <span id={errorId} role="alert" class="text-xs text-io-content-danger">
    {#if showError}{error}{/if}
  </span>
</div>
