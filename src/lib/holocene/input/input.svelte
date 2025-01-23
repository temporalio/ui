<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Label from '$lib/holocene/label.svelte';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';

  import IconButton from '../icon-button.svelte';

  type AutoComplete =
    | 'on'
    | 'off'
    | 'name'
    | 'email'
    | 'username'
    | 'new-password'
    | 'current-password';

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
    autocomplete?: AutoComplete;
    hideCount?: boolean;
    spellcheck?: boolean;
    noBorder?: boolean;
    autoFocus?: boolean;
    error?: boolean;
    'data-testid'?: string;
    copyable?: boolean;
    copyButtonLabel?: string;
    clearable?: boolean;
    clearButtonLabel?: string;
    clear?: () => void;
    onclick?: (e: MouseEvent) => void;
    onkeydown?: (e: KeyboardEvent) => void;
    before_input?: Snippet<[{ disabled: boolean }]>;
    after_input?: Snippet<[{ disabled: boolean }]>;
  };

  type CopyableProps = BaseProps & {
    copyable: true;
    copyButtonLabel: string;
  };

  type ClearableProps = BaseProps & {
    clearable: true;
    clearButtonLabel: string;
  };

  type Props = BaseProps | CopyableProps | ClearableProps;

  let {
    id,
    value = $bindable(),
    label,
    labelHidden = false,
    icon = null,
    placeholder = '',
    suffix = '',
    name = id,
    copyable = false,
    disabled: isDisabled = false,
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
    clear = () => {},
    onclick = () => {},
    onkeydown = () => {},
    before_input,
    after_input,
    ...rest
  }: Props = $props();

  let testId = rest['data-testid'] || id;

  function callFocus(input: HTMLInputElement) {
    if (autoFocus && input) input.focus();
  }

  function onClear() {
    value = '';
    clear();
  }

  const { copy, copied } = copyToClipboard();
  let disabled = $derived(isDisabled || copyable);
</script>

<div class={merge('flex flex-col gap-1', className)}>
  <Label {required} {label} hidden={labelHidden} for={id} />
  <div class="input-group flex">
    {@render before_input?.({ disabled })}
    <div
      class={merge(
        'input-container',
        'surface-primary relative box-border inline-flex h-10 w-full items-center border border-subtle text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-primary/70',
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
        onclick={(e: MouseEvent) => {
          e.stopPropagation();
          onclick(e);
        }}
        onkeydown={(e: KeyboardEvent) => {
          e.stopPropagation();
          onkeydown(e);
        }}
        use:callFocus
        data-testid={testId}
        {...rest}
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
    {@render after_input?.({ disabled })}
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
