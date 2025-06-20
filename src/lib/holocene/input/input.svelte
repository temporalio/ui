<script lang="ts">
  import type { FullAutoFill, HTMLInputAttributes } from 'svelte/elements';

  import { createEventDispatcher } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { useFormField } from '$lib/holocene/form/use-form-field.svelte';
  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Label from '$lib/holocene/label.svelte';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';

  import IconButton from '../icon-button.svelte';

  type BaseProps = HTMLInputAttributes & {
    id?: string;
    value?: string;
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

  export let id: string = undefined;
  export let value: string = '';
  export let label: string;
  export let labelHidden = false;
  export let icon: IconName = null;
  export let placeholder = '';
  export let suffix = '';
  export let prefix = '';
  export let name: string = undefined;
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

  let resolvedId =
    id ||
    (name
      ? `input-${name}`
      : `input-${Math.random().toString(36).substr(2, 9)}`);
  let resolvedName = name || resolvedId;
  let testId = $$props['data-testid'] || resolvedId;

  // Form integration using subscription-based helper
  $: formField = useFormField({
    name: resolvedName,
    value,
    valid,
    error,
    hintText,
  });

  // Extract resolved values from form field binding
  $: ({
    bindableValue,
    resolvedValid,
    resolvedError,
    resolvedHintText,
    resolvedConstraints,
  } = formField);

  function callFocus(input: HTMLInputElement) {
    if (autoFocus && input) input.focus();
  }

  const dispatch = createEventDispatcher();
  function onClear() {
    formField.setValue('');
    dispatch('clear', {});
  }

  const { copy, copied } = copyToClipboard();
  $: disabled = disabled || copyable;
</script>

<div class={merge('flex flex-col gap-1', className)}>
  <Label {required} {label} hidden={labelHidden} for={resolvedId} />
  <div class="input-group flex">
    <slot name="before-input" {disabled} />
    <div
      class={merge(
        'input-container',
        'surface-primary relative box-border inline-flex h-10 w-full items-center border border-subtle text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/70',
      )}
      class:disabled
      class:error={resolvedError}
      class:noBorder
      class:invalid={!resolvedValid}
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
        id={resolvedId}
        name={resolvedName}
        {spellcheck}
        {required}
        {autocomplete}
        bind:value={bindableValue}
        on:click|stopPropagation
        on:input
        on:keydown|stopPropagation
        on:change
        on:focus
        on:blur
        use:callFocus
        data-testid={testId}
        {...$$restProps}
        {...resolvedConstraints}
      />
      {#if copyable}
        <div class="copy-icon-container">
          <button
            aria-label={copyButtonLabel}
            on:click={(e) => copy(e, bindableValue)}
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
      {:else if clearable && bindableValue}
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
            class:ok={maxLength - bindableValue.length > 5}
            class:warn={maxLength - bindableValue.length <= 5}
            class:error={maxLength === bindableValue.length}
            >{bindableValue.length}</span
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
    class:invalid={!resolvedValid}
    class:error={resolvedError}
    class:hidden={!resolvedHintText}
    role={resolvedError ? 'alert' : null}
  >
    {resolvedHintText}
  </span>
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
    @apply m-2 w-full bg-transparent placeholder:text-secondary focus:outline-none;
  }

  .prefix {
    @apply block h-full w-fit border-r border-subtle px-4 py-2 text-secondary;
  }

  .suffix {
    @apply block h-full w-fit border-l border-subtle px-4 py-2;
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
