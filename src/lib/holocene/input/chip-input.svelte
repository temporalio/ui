<script lang="ts">
  import { writable } from 'svelte/store';

  import { onDestroy, tick } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Chip from '$lib/holocene/chip.svelte';
  import Label from '$lib/holocene/label.svelte';

  interface Props {
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
    removeChipButtonLabel?: string | ((chipValue: string) => string);
    external?: boolean;
    class?: string;
  }

  let {
    id,
    chips = $bindable(),
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
    class: className = '',
  }: Props = $props();

  const values = writable<string[]>(chips);
  let displayValue = $state('');
  let shouldScrollToInput = $state(false);
  let inputContainer: HTMLDivElement = $state();
  let input: HTMLInputElement = $state();

  $effect(() => {
    $values = chips;
  });

  let invalid = $derived($values.some((chip) => !validator(chip)));

  const scrollToInput = () => {
    let rect = input.getBoundingClientRect();
    inputContainer.scrollTo(rect.x, rect.y);
    shouldScrollToInput = false;
  };

  const unsubscribe = values.subscribe((updatedChips) => {
    shouldScrollToInput = updatedChips.length > chips.length;
    chips = updatedChips;
  });

  $effect(() => {
    tick().then(() => {
      if (shouldScrollToInput) scrollToInput();
    });
  });

  onDestroy(() => {
    unsubscribe();
  });

  const handleKeydown = (e: KeyboardEvent) => {
    e.stopPropagation();
    const value = displayValue.trim();
    if ((e.key === ',' || e.key === 'Enter') && value !== '') {
      e.preventDefault();
      values.update((previous) => [...previous, value]);
      displayValue = '';
    }

    const eventTarget = e.target as HTMLInputElement;
    if (
      e.key === 'Backspace' &&
      eventTarget &&
      eventTarget.value === '' &&
      $values.length > 0
    ) {
      values.update((previous) => previous.slice(0, -1));
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    e.preventDefault();
    const clipboardContents = e.clipboardData.getData('text/plain');
    values.update((previous) => [
      ...previous,
      ...clipboardContents.split(',').map((content) => content.trim()),
    ]);
  };

  const handleBlur = () => {
    const value = displayValue.trim();
    if (value !== '') {
      values.update((previous) => [...previous, value]);
      displayValue = '';
    }
  };

  const removeChip = (index: number) => {
    values.update((previous) => {
      previous.splice(index, 1);
      return previous;
    });
  };
</script>

<div class={merge(disabled && 'cursor-not-allowed', className)}>
  <Label
    class="pb-1"
    {required}
    {label}
    {disabled}
    hidden={labelHidden}
    for={id}
  />
  <div
    bind:this={inputContainer}
    class={merge(
      'surface-primary flex max-h-20 min-h-[2.5rem] w-full flex-row flex-wrap gap-1 overflow-y-scroll border border-subtle p-2 text-sm text-primary focus-within:border-interactive focus-within:ring-2 focus-within:ring-primary/70',
      disabled && 'cursor-not-allowed opacity-65',
      invalid && 'invalid',
    )}
  >
    {#if $values.length > 0 && !external}
      {#each $values as chip, i (`${chip}-${i}`)}
        {@const valid = validator(chip)}
        <Chip
          removeButtonLabel={typeof removeChipButtonLabel === 'string'
            ? removeChipButtonLabel
            : removeChipButtonLabel(chip)}
          remove={() => removeChip(i)}
          intent={valid ? 'default' : 'warning'}
          {disabled}>{chip}</Chip
        >
      {/each}
    {/if}
    <input
      data-lpignore="true"
      data-1p-ignore="true"
      autocomplete="off"
      class:cursor-not-allowed={disabled}
      {disabled}
      {placeholder}
      {id}
      {name}
      {required}
      multiple
      data-testid={id}
      bind:this={input}
      bind:value={displayValue}
      onblur={handleBlur}
      onkeydown={handleKeydown}
      onpaste={handlePaste}
    />
  </div>
  {#if invalid && hintText}
    <span class="hint">
      {hintText}
    </span>
  {/if}
  {#if $values.length > 0 && external}
    <div class="mt-1 flex flex-row flex-wrap gap-1">
      {#each $values as chip, i (`${chip}-${i}`)}
        {@const valid = validator(chip)}
        <Chip
          removeButtonLabel={typeof removeChipButtonLabel === 'string'
            ? removeChipButtonLabel
            : removeChipButtonLabel(chip)}
          remove={() => removeChip(i)}
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
    @apply surface-primary inline-block w-full focus:outline-none;
  }

  .hint {
    @apply text-xs text-danger;
  }
</style>
