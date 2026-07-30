<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Label from './label.svelte';

  interface Props extends HTMLTextareaAttributes {
    disabled?: boolean;
    error?: string;
    isValid?: boolean;
    placeholder?: string;
    rows?: number;
    spellcheck?: boolean;
    value: string;
    label: string;
    labelHidden?: boolean;
    id: string;
    required?: boolean;
    description?: string;
    maxLength?: number;
    class?: string;
    errorSnippet?: Snippet;
  }

  let {
    disabled = false,
    error = '',
    isValid = true,
    placeholder = '',
    rows = 5,
    spellcheck,
    value = $bindable(),
    label,
    labelHidden = false,
    id,
    required = false,
    description = '',
    maxLength = 0,
    class: className = 'text-primary',
    onkeydown,
    errorSnippet,
    ...rest
  }: Props = $props();

  const errorId = $derived(`${id}-error`);

  const handleKeydown = (
    event: KeyboardEvent & { currentTarget: HTMLTextAreaElement },
  ) => {
    event.stopPropagation();
    onkeydown?.(event);
  };
</script>

<div class={merge('group flex flex-col gap-1', className)}>
  <Label {required} hidden={labelHidden} {label} for={id} />
  {#if description}
    <p class="-mt-1 text-sm">{description}</p>
  {/if}
  <div
    class={merge(
      'relative box-border inline-flex w-full border border-subtle focus-within:border-information focus-within:ring-2 focus-within:ring-primary/70',
      !isValid && 'error',
      !disabled && 'hover:border-information',
    )}
  >
    <textarea
      bind:value
      class={merge(
        'surface-primary min-h-fit w-full px-3 py-2 text-sm focus-visible:outline-none',
        disabled && 'cursor-not-allowed opacity-50',
      )}
      {id}
      {disabled}
      {placeholder}
      {rows}
      {spellcheck}
      {required}
      aria-invalid={!isValid ? 'true' : undefined}
      aria-describedby={!isValid && error ? errorId : undefined}
      onkeydown={handleKeydown}
      maxlength={maxLength > 0 ? maxLength : undefined}
      data-testid={id}
      {...rest}
    ></textarea>
  </div>
  <div class="flex justify-between gap-2">
    <div
      id={errorId}
      class="error-msg"
      class:min-width={maxLength}
      role="alert"
    >
      {#if !isValid}
        {#if error}
          <p>{error}</p>
        {/if}
        {@render errorSnippet?.()}
      {/if}
    </div>
    {#if maxLength && !disabled}
      <span class="count">
        <span
          class="text-information"
          class:warn={maxLength - value?.length <= 5}
          class:error={maxLength === value?.length}>{value?.length ?? 0}</span
        >&nbsp;/&nbsp;{maxLength}
      </span>
    {/if}
  </div>
</div>

<style lang="postcss">
  .error {
    @apply border-danger focus-within:border-danger focus-within:ring-2 focus-within:ring-danger/70;
  }

  .error-msg {
    @apply min-h-[1.25rem] break-words border-danger text-xs text-danger;
  }

  .error-msg.min-width {
    @apply w-[calc(100%-6rem)];
  }

  .count {
    @apply invisible text-right text-xs text-primary group-focus-within:visible;
  }

  .count > .warn {
    @apply text-warning;
  }

  .count > .error {
    @apply text-danger;
  }
</style>
