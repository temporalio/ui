<script lang="ts">
  import type { FullAutoFill, HTMLInputAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Label from '$lib/holocene/label.svelte';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';

  import IconButton from '../icon-button.svelte';

  interface Props extends HTMLInputAttributes {
    id: string;
    value: string;
    label: string;
    afterLabel?: Snippet;
    labelHidden?: boolean;
    icon?: IconName;
    suffix?: string;
    prefix?: string;
    valid?: boolean;
    hintText?: string;
    maxLength?: number;
    hideCount?: boolean;
    noBorder?: boolean;
    autoFocus?: boolean;
    error?: boolean;
    autocomplete?: FullAutoFill;
    copyable?: boolean;
    copyButtonLabel?: string;
    clearable?: boolean;
    clearButtonLabel?: string;
    'data-testid'?: string;
    class?: string;
    inputContainerClass?: string;
    onClear?: () => void;
    beforeInput?: Snippet<[{ disabled: boolean }]>;
    afterInput?: Snippet<[{ disabled: boolean }]>;
  }

  let {
    id,
    value = $bindable(),
    label,
    afterLabel,
    labelHidden = false,
    icon = undefined,
    placeholder = '',
    suffix = '',
    prefix = '',
    name = id,
    copyable = false,
    disabled = false,
    clearable = false,
    autocomplete = 'off',
    valid = true,
    hintText = '',
    maxLength = 0,
    hideCount = false,
    spellcheck = undefined,
    noBorder = false,
    autoFocus = false,
    error = false,
    required = false,
    copyButtonLabel = '',
    clearButtonLabel = '',
    class: className = '',
    inputContainerClass = '',
    'data-testid': dataTestId,
    onClear,
    onclick,
    onkeydown,
    beforeInput,
    afterInput,
    ...rest
  }: Props = $props();

  const isDisabled = $derived(disabled || copyable);
  const testId = $derived(dataTestId || id);
  const errorId = $derived(`${id}-error`);
  const hintId = $derived(`${id}-hint`);
  const showError = $derived(error || !valid);

  function callFocus(input: HTMLInputElement) {
    if (autoFocus && input) input.focus();
  }

  function handleClear() {
    value = '';
    onClear?.();
  }

  const { copy, copied } = copyToClipboard();
</script>

<div class={merge('group flex flex-col gap-1', className)}>
  <div
    class={merge(
      'flex items-center justify-start gap-2',
      !afterLabel && 'contents',
    )}
  >
    <Label
      class="grow-0"
      required={required ?? false}
      {label}
      hidden={labelHidden}
      for={id}
    />
    {@render afterLabel?.()}
  </div>
  <div class="input-group flex">
    {@render beforeInput?.({ disabled: isDisabled })}
    <div
      class={merge(
        'input-container',
        'surface-primary relative box-border inline-flex h-10 w-full items-center border border-subtle text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/70',
        inputContainerClass,
      )}
      class:disabled={isDisabled}
      class:error
      class:noBorder
      class:invalid={!valid}
    >
      {#if icon}
        <span class="icon-container">
          <Icon name={icon} />
        </span>
      {:else if prefix}
        <p class="prefix">{prefix}</p>
      {/if}
      <input
        class="input"
        class:disabled={isDisabled}
        disabled={isDisabled}
        data-lpignore="true"
        data-1p-ignore="true"
        maxlength={maxLength > 0 ? maxLength : undefined}
        {placeholder}
        {id}
        {name}
        {spellcheck}
        {required}
        aria-invalid={showError ? 'true' : undefined}
        aria-describedby={hintText ? (showError ? errorId : hintId) : undefined}
        {autocomplete}
        bind:value
        onclick={(e) => {
          e.stopPropagation();
          onclick?.(e);
        }}
        onkeydown={(e) => {
          e.stopPropagation();
          onkeydown?.(e);
        }}
        use:callFocus
        data-testid={testId}
        {...rest}
      />
      {#if copyable}
        <div class="copy-icon-container">
          <button
            aria-label={copyButtonLabel}
            data-track-name="input-copy-button"
            data-track-intent="copy"
            data-track-text={label || copyButtonLabel}
            onclick={(e) => copy(e, value)}
          >
            {#if $copied}
              <Icon name="checkmark" />
            {:else}
              <Icon name="copy" />
            {/if}
          </button>
        </div>
      {:else if isDisabled}
        <div class="disabled-icon-container">
          <Icon name="lock" />
        </div>
      {:else if clearable && value}
        <div class="clear-icon-container" data-testid="clear-input">
          <IconButton
            label={clearButtonLabel}
            on:click={handleClear}
            icon="close"
          />
        </div>
      {/if}
      {#if suffix}
        <div class="suffix">
          {suffix}
        </div>
      {/if}
    </div>
    {@render afterInput?.({ disabled: isDisabled })}
  </div>

  <div
    class="inline-flex justify-between gap-2"
    class:hidden={!hintText && (!maxLength || isDisabled || hideCount)}
  >
    <span
      id={errorId}
      role="alert"
      class="hint-text error inline-block"
      class:hidden={!showError}
    >
      {#if showError}{hintText}{/if}
    </span>
    <span id={hintId} class="hint-text inline-block" class:hidden={showError}>
      {#if !showError}{hintText}{/if}
    </span>
    {#if maxLength && !isDisabled && !hideCount}
      <span
        class="invisible text-right text-xs tracking-widest group-focus-within:visible"
      >
        <span
          class={merge(
            maxLength - value?.length > 5 && 'text-success',
            maxLength - value?.length <= 5 && 'text-warning',
            maxLength === value?.length && 'text-danger',
          )}
        >
          {value?.length ?? 0}
        </span>/{maxLength}
      </span>
    {/if}
  </div>
</div>

<style lang="postcss">
  /* Base styles */
  .input-container {
    &.error,
    &.invalid {
      @apply border-danger focus-within:ring-danger/70;

      > .input {
        @apply caret-danger;
      }
    }

    &.disabled {
      @apply opacity-50;
    }
  }

  .input {
    @apply m-2 h-full w-full bg-transparent focus:text-brand focus:outline-none;
  }

  .prefix {
    @apply block h-full w-fit border-r border-subtle px-4 py-2 text-secondary;
  }

  .suffix {
    @apply block h-full w-fit border-l border-subtle bg-subtle px-4 py-2;
  }

  .noBorder {
    @apply border-none;
  }

  .icon-container {
    @apply ml-2 flex items-center justify-center;
  }

  .copy-icon-container {
    @apply flex h-full w-9 cursor-pointer items-center justify-center border-l border-subtle;
  }

  .disabled-icon-container {
    @apply flex h-full w-9 items-center justify-center px-1;
  }

  .clear-icon-container {
    @apply mr-2 flex w-6 cursor-pointer items-center justify-center;
  }

  .hint-text {
    @apply text-xs text-primary;

    &.error,
    &.invalid {
      @apply text-danger;
    }
  }

  input[type='search']::-webkit-search-cancel-button {
    @apply hidden;
  }
</style>
