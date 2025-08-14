<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import type { IconName } from '$lib/anthropocene/icon';
  import Icon from '$lib/anthropocene/icon/icon.svelte';
  import Label from '$lib/anthropocene/label.svelte';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';

  import IconButton from '../icon-button.svelte';

  type BaseProps = HTMLInputAttributes & {
    id: string;
    value: string;
    label: string;
    labelHidden?: boolean;
    icon?: IconName;
    suffix?: string;
    prefix?: string;
    valid?: boolean;
    hintText?: string;
    maxLength?: number;
    hideCount?: boolean;
    spellcheck?: boolean;
    noBorder?: boolean;
    autoFocus?: boolean;
    error?: boolean;
    'data-testid'?: string;
    class?: string;
    copyable?: boolean;
    copyButtonLabel?: string;
    clearable?: boolean;
    clearButtonLabel?: string;
    beforeInput?: Snippet<[{ disabled: boolean }]>;
    afterInput?: Snippet<[{ disabled: boolean }]>;
    onclear?: (event: CustomEvent<Record<string, never>>) => void;
  };

  type Props = BaseProps;

  let {
    id,
    value = $bindable(''),
    label,
    labelHidden = false,
    icon = null,
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
    spellcheck = null,
    noBorder = false,
    autoFocus = false,
    error = false,
    required = false,
    copyButtonLabel = '',
    clearButtonLabel = '',
    class: className = '',
    'data-testid': testId = id,
    beforeInput,
    afterInput,
    onclear,
    ...restProps
  }: Props = $props();

  function callFocus(input: HTMLInputElement) {
    if (autoFocus && input) input.focus();
  }

  function onClear() {
    value = '';
    onclear?.(new CustomEvent('clear', { detail: {} }));
  }

  const { copy, copied } = copyToClipboard();

  const isDisabled = $derived(disabled || copyable);
</script>

<div class={merge('group flex flex-col gap-1', className)}>
  <Label {required} {label} hidden={labelHidden} for={id} />
  <div class="input-group flex">
    {#if beforeInput}
      {@render beforeInput({ disabled: isDisabled })}
    {/if}
    <div
      class={merge(
        'input-container',
        'surface-primary relative box-border inline-flex h-10 w-full items-center border border-subtle text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/70',
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
        {autocomplete}
        bind:value
        onclick={(e) => e.stopPropagation()}
        oninput
        onkeydown={(e) => e.stopPropagation()}
        onchange
        onfocus
        onblur
        use:callFocus
        data-testid={testId}
        {...restProps}
      />
      {#if copyable}
        <div class="copy-icon-container">
          <button aria-label={copyButtonLabel} onclick={(e) => copy(e, value)}>
            {#if $copied}
              <Icon name="checkmark" />
            {:else}
              <Icon name="copy" />
            {/if}
          </button>
        </div>
      {:else if disabled}
        <div class="disabled-icon-container">
          <Icon name="lock" />
        </div>
      {:else if clearable && value}
        <div class="clear-icon-container" data-testid="clear-input">
          <IconButton label={clearButtonLabel} onclick={onClear} icon="close" />
        </div>
      {/if}
      {#if suffix}
        <div class="suffix">
          {suffix}
        </div>
      {/if}
    </div>
    {#if afterInput}
      {@render afterInput({ disabled: isDisabled })}
    {/if}
  </div>

  <div
    class="inline-flex justify-between gap-2"
    class:hidden={!hintText && (!maxLength || isDisabled || hideCount)}
  >
    <span
      class="hint-text inline-block"
      class:invalid={!valid}
      class:error
      role={error ? 'alert' : null}
    >
      {hintText}
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
    @apply m-2 w-full bg-transparent placeholder:text-secondary focus:text-brand focus:outline-none;
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
