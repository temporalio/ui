<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import { getFormContext } from './context/form-context';
  import Label from '../label.svelte';

  let {
    autocomplete,
    spellcheck,
    placeholder,
    noBorder,
    name,
    label,
    disabled,
    className,
    ...restProps
  } = $props();

  const formContext = getFormContext();

  let data = $derived(formContext?.form?.form);
  let errors = $derived(formContext?.form?.errors);
  let constraints = $derived(formContext?.form?.constraints);
  let message = $derived(formContext?.form?.message);

  let id = $derived(name);
  let valid = $derived($errors?.[name] === undefined);
  let hintText = $derived($errors?.[name]?.[0]);
  let error = $derived($errors?.[name]);
  let testId = $derived(`${name}-input`);

  $effect(() => {
    console.log('Input component re-rendered with:', {
      id,
      name,
      valid,
      hintText,
      error,
      testId,
      message: $message,
      constraints: $constraints?.[name],
    });
  });
</script>

{#if $message}<h3>{$message}</h3>{/if}

<div class={merge('flex flex-col gap-1', className)}>
  <Label {label} for={id} />

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
    <input
      class="input"
      class:disabled
      {disabled}
      data-lpignore="true"
      data-1p-ignore="true"
      {placeholder}
      {id}
      {name}
      {spellcheck}
      {autocomplete}
      bind:value={$data[name]}
      data-testid={testId}
      {...restProps}
      {...$constraints[name]}
    />

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
