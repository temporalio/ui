<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

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
    valid?: boolean;
    hintText?: string;
    maxLength?: number;
    hideCount?: boolean;
    spellcheck?: boolean;
    unroundRight?: boolean;
    unroundLeft?: boolean;
    noBorder?: boolean;
    autoFocus?: boolean;
    error?: boolean;
    'data-testid'?: string;
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
  export let name = id;
  export let copyable = false;
  export let disabled = false;
  export let clearable = false;
  export let autocomplete = 'off';
  export let valid = true;
  export let hintText = '';
  export let maxLength = 0;
  export let hideCount = false;
  export let spellcheck: boolean = null;
  export let unroundRight = false;
  export let unroundLeft = false;
  export let noBorder = false;
  export let autoFocus = false;
  export let error = false;
  export let required = false;
  export let copyButtonLabel = '';
  export let clearButtonLabel = '';

  let className = '';
  export { className as class };

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

<div class={merge('flex flex-col gap-1', className)}>
  <Label {required} {label} hidden={labelHidden} for={id} />
  <div class="input-group flex rounded-lg">
    <slot name="before-input" {disabled} />
    <div
      class={merge(
        'surface-primary relative box-border inline-flex h-10 w-full items-center rounded-lg border border-subtle text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/70',
      )}
      class:disabled
      class:error
      class:noBorder
      class:unroundLeft={unroundLeft || $$slots['before-input']}
      class:unroundRight={unroundRight || $$slots['after-input']}
      class:invalid={!valid}
    >
      {#if icon}
        <span class="icon-container">
          <Icon name={icon} />
        </span>
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
          <button aria-label={copyButtonLabel} on:click={(e) => copy(e, value)}>
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
      {#if maxLength && !disabled && !hideCount}
        <span class="count">
          <span
            class:ok={maxLength - value.length > 5}
            class:warn={maxLength - value.length <= 5}
            class:error={maxLength === value.length}>{value.length}</span
          >/{maxLength}
        </span>
      {/if}
      {#if suffix}
        <div class="suffix">
          {suffix}
        </div>
      {/if}
    </div>
    <slot name="after-input" {disabled} />
  </div>

  <span
    class="hint-text inline-block"
    class:invalid={!valid}
    class:error
    class:hidden={!hintText}
    role={error ? 'alert' : null}
  >
    {hintText}
  </span>
</div>

<style lang="postcss">
  /* Base styles */
  .input-container {
    /* @apply ; */

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
    @apply m-2 w-full bg-transparent placeholder:text-secondary focus:outline-none;
  }

  .suffix {
    @apply block h-full w-fit rounded-br rounded-tr border-l border-subtle px-4 py-2;
  }

  .unroundRight {
    @apply rounded-br-none rounded-tr-none border-r-0;
  }

  .unroundLeft {
    @apply rounded-bl-none rounded-tl-none border-l-0;
  }

  .noBorder {
    @apply border-none;
  }

  .icon-container {
    @apply ml-2 flex items-center justify-center;
  }

  .copy-icon-container {
    @apply flex h-full w-9 cursor-pointer items-center justify-center rounded-r border-l border-subtle;
  }

  .disabled-icon-container {
    @apply flex h-full w-9 items-center justify-center px-1;
  }

  .clear-icon-container {
    @apply mr-2 flex w-6 cursor-pointer items-center justify-center rounded-full;
  }

  .count {
    @apply mx-2 hidden text-sm font-medium tracking-widest;

    > .ok {
      @apply text-success;
    }

    > .warn {
      @apply text-warning;
    }

    > .error {
      @apply text-danger;
    }
  }

  .input:focus ~ .count {
    @apply block;
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
