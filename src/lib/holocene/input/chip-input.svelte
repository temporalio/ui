<script lang="ts">
  import { writable } from 'svelte/store';

  import { afterUpdate, onDestroy } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Chip from '$lib/holocene/chip.svelte';
  import Label from '$lib/holocene/label.svelte';

  export let id: string;
  export let chips: string[];
  export let label: string;
  export let labelHidden = false;
  export let placeholder = '';
  export let name = id;
  export let disabled = false;
  export let required = false;
  export let hintText = '';
  export let validator: (value: string) => boolean = () => true;
  export let removeChipButtonLabel: string | ((chipValue: string) => string);
  export let external = false;

  const values = writable<string[]>(chips);
  let displayValue = '';
  let shouldScrollToInput = false;
  let inputContainer: HTMLDivElement;
  let input: HTMLInputElement;

  $: chips, ($values = chips);
  $: invalid = $values.some((chip) => !validator(chip));

  let className = '';
  export { className as class };

  const scrollToInput = () => {
    let rect = input.getBoundingClientRect();
    inputContainer.scrollTo(rect.x, rect.y);
    shouldScrollToInput = false;
  };

  const unsubscribe = values.subscribe((updatedChips) => {
    shouldScrollToInput = updatedChips.length > chips.length;
    chips = updatedChips;
  });

  afterUpdate(() => {
    if (shouldScrollToInput) {
      scrollToInput();
    }
  });

  onDestroy(() => {
    unsubscribe();
  });

  const handleKeydown = (e: KeyboardEvent) => {
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
          on:remove={() => removeChip(i)}
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
      on:blur={handleBlur}
      on:keydown|stopPropagation={handleKeydown}
      on:paste={handlePaste}
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
          on:remove={() => removeChip(i)}
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
