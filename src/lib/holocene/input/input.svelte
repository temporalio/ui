<script lang="ts">
  import type { FullAutoFill, HTMLInputAttributes } from 'svelte/elements';

  import { createEventDispatcher } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Label from '$lib/holocene/label.svelte';
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
    inputClass?: string;
  };

  type CopyableProps = BaseProps & {
    copyable: boolean;
    copyButtonLabel: string;
  };

  type ClearableProps = BaseProps & {
    clearable: boolean;
    clearButtonLabel: string;
  };

  type $$Props = BaseProps | CopyableProps | ClearableProps;

  export let id: string;
  export let value: string;
  export let label: string;
  export let labelHidden = false;
  export let icon: IconName = null;
  export let placeholder = '';
  export let suffix = '';
  export let prefix = '';
  export let name = id;
  export let copyable = false;
  export let disabled = false;
  export let clearable = false;
  export let autocomplete: FullAutoFill = 'off';
  export let valid = true;
  export let hintText = '';
  export let maxLength = 0;
  export let hideCount = false;
  export let spellcheck: boolean = null;
  export let noBorder = false;
  export let autoFocus = false;
  export let error = false;
  export let required = false;
  export let copyButtonLabel = '';
  export let clearButtonLabel = '';

  let className = '';
  export { className as class };
  export let inputClass = '';

  let testId = $$props['data-testid'] || id;

  function callFocus(input: HTMLInputElement) {
    if (autoFocus && input) input.focus();
  }

  const dispatch = createEventDispatcher();
  function onClear() {
    value = '';
    dispatch('clear', {});
  }

  const { copy, copied } = copyToClipboard();
  $: disabled = disabled || copyable;
</script>

<div class={merge('group flex flex-col gap-1', className)}>
  <Label {required} {label} hidden={labelHidden} for={id} />
  <div class="input-group flex">
    <slot name="before-input" {disabled} />
    <div
      class={merge(
        'input-container',
        'surface-primary relative box-border inline-flex h-10 w-full items-center border border-subtle text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/70',
        inputClass,
      )}
      class:disabled
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
        class:disabled
        {disabled}
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
        on:click|stopPropagation
        on:input
        on:keydown|stopPropagation
        on:change
        on:focus
        on:blur
        use:callFocus
        data-testid={testId}
        {...$$restProps}
      />
      {#if copyable}
        <div class="copy-icon-container">
          <button
            aria-label={copyButtonLabel}
            data-track-name="input-copy-button"
            data-track-intent="copy"
            data-track-text={label || copyButtonLabel}
            on:click={(e) => copy(e, value)}
          >
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
          <IconButton
            label={clearButtonLabel}
            on:click={onClear}
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
    <slot name="after-input" {disabled} />
  </div>

  <div
    class="inline-flex justify-between gap-2"
    class:hidden={!hintText && (!maxLength || disabled || hideCount)}
  >
    <span
      class="hint-text inline-block"
      class:invalid={!valid}
      class:error
      role={error ? 'alert' : null}
    >
      {hintText}
    </span>
    {#if maxLength && !disabled && !hideCount}
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
