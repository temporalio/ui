<script lang="ts">
  import type { FullAutoFill } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import Chip from '$lib/holocene/chip.svelte';
  import Label from '$lib/holocene/label.svelte';

  type Props = {
    id: string;
    chips: string[];
    label: string;
    labelHidden?: boolean;
    placeholder?: string;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    hintText?: string;
    validator?: (value: string) => boolean;
    removeChipButtonLabel: string | ((chipValue: string) => string);
    external?: boolean;
    maxLength?: number;
    class?: string;
    scrollTo?: boolean;
    autocomplete?: FullAutoFill;
  };

  let {
    id,
    chips = $bindable([]),
    label,
    labelHidden = false,
    placeholder = '',
    name = id,
    disabled = false,
    required = false,
    hintText = '',
    validator = () => true,
    removeChipButtonLabel,
    external = false,
    maxLength = 0,
    class: className = '',
    scrollTo = false,
    autocomplete = 'off',
  }: Props = $props();

  let displayValue = $state('');

  const invalid = $derived(chips.some((chip) => !validator(chip)));
  const errorId = $derived(`${id}-error`);

  const handleKeydown = (e: KeyboardEvent) => {
    e.stopPropagation();
    const value = displayValue.trim();
    if ((e.key === ',' || e.key === 'Enter') && value !== '') {
      e.preventDefault();
      chips = [...chips, value];
      displayValue = '';
    }

    const eventTarget = e.target as HTMLInputElement;
    if (
      e.key === 'Backspace' &&
      eventTarget &&
      eventTarget.value === '' &&
      chips.length > 0
    ) {
      chips = chips.slice(0, -1);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    if (maxLength && chips.length >= maxLength) return;
    const clipboardContents = e.clipboardData?.getData('text/plain') ?? '';
    let newValues = clipboardContents
      .split(',')
      .map((content) => content.trim());

    if (maxLength) {
      newValues = newValues.slice(0, maxLength - chips.length);
    }

    chips = [...chips, ...newValues];
  };

  const handleBlur = () => {
    const value = displayValue.trim();
    if (value !== '') {
      chips = [...chips, value];
      displayValue = '';
    }
  };

  const removeChip = (index: number) => {
    chips = chips.toSpliced(index, 1);
  };

  const scrollIntoView = (element: HTMLInputElement, _: string[]) => {
    return {
      update: () => {
        if (scrollTo && element === document.activeElement) {
          element.scrollIntoView({ block: 'nearest', inline: 'start' });
        }
      },
    };
  };
</script>

<div
  class={merge(
    'group flex flex-col gap-1',
    disabled && 'cursor-not-allowed',
    className,
  )}
>
  <Label {required} {label} {disabled} hidden={labelHidden} for={id} />
  <div
    class={merge(
      'surface-primary flex min-h-[2.5rem] w-full flex-row flex-wrap gap-1 overflow-y-scroll border border-subtle p-2 text-sm text-primary focus-within:border-interactive focus-within:ring-2 focus-within:ring-primary/70',
      disabled && 'cursor-not-allowed opacity-65',
      invalid && 'invalid',
    )}
  >
    {#if chips.length > 0 && !external}
      {#each chips as chip, i (`${chip}-${i}`)}
        {@const valid = validator(chip)}
        <Chip
          removeButtonLabel={typeof removeChipButtonLabel === 'string'
            ? removeChipButtonLabel
            : removeChipButtonLabel(chip)}
          onremove={() => removeChip(i)}
          intent={valid ? 'default' : 'warning'}
          {disabled}>{chip}</Chip
        >
      {/each}
    {/if}
    <input
      data-lpignore="true"
      data-1p-ignore="true"
      {autocomplete}
      class:cursor-not-allowed={disabled}
      {disabled}
      {placeholder}
      {id}
      {name}
      {required}
      aria-invalid={invalid ? 'true' : undefined}
      aria-describedby={invalid && hintText ? errorId : undefined}
      multiple
      data-testid={id}
      bind:value={displayValue}
      onblur={handleBlur}
      onkeydown={handleKeydown}
      onpaste={handlePaste}
      use:scrollIntoView={chips}
      maxlength={maxLength && chips.length >= maxLength ? 0 : undefined}
      size={placeholder.length || undefined}
    />
  </div>

  <div class="flex justify-between gap-2">
    <div
      id={errorId}
      class="error-msg"
      class:min-width={maxLength}
      role="alert"
    >
      {#if invalid && hintText}
        <p>{hintText}</p>
      {/if}
    </div>
    {#if maxLength && !disabled}
      <span class="count">
        <span
          class="text-information"
          class:warn={maxLength - chips.length <= 5}
          class:error={maxLength === chips?.length}
        >
          {chips.length}
        </span>&nbsp;/&nbsp;{maxLength}
      </span>
    {/if}
  </div>

  {#if chips.length > 0 && external}
    <div class="flex flex-row flex-wrap gap-1">
      {#each chips as chip, i (`${chip}-${i}`)}
        {@const valid = validator(chip)}
        <Chip
          removeButtonLabel={typeof removeChipButtonLabel === 'string'
            ? removeChipButtonLabel
            : removeChipButtonLabel(chip)}
          onremove={() => removeChip(i)}
          intent={valid ? 'default' : 'warning'}
          {disabled}>{chip}</Chip
        >
      {/each}
    </div>
  {/if}
</div>

<style lang="postcss">
  .invalid {
    @apply border-danger focus-within:border-danger focus-within:ring-2 focus-within:ring-danger/70;
  }

  input {
    @apply surface-primary inline-block grow focus:outline-none;
  }

  .error-msg {
    @apply break-words text-sm text-danger;
  }

  .error-msg.min-width {
    @apply w-[calc(100%-6rem)];
  }

  .count {
    @apply invisible text-right text-sm font-medium text-primary group-focus-within:visible;
  }

  .count > .warn {
    @apply text-warning;
  }

  .count > .error {
    @apply text-danger;
  }
</style>
