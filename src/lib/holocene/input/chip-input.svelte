<script lang="ts">
  import { writable } from 'svelte/store';

  import { afterUpdate } from 'svelte';
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
  export let maxLength = 0;

  const values = writable<string[]>(chips);
  let displayValue = '';
  let inputContainer: HTMLDivElement;
  let input: HTMLInputElement;

  $: chips, ($values = chips);
  $: invalid = $values.some((chip) => !validator(chip));

  let className = '';
  export { className as class };

  afterUpdate(() => {
    input.scrollIntoView({ block: 'nearest', inline: 'start' });
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
    if (maxLength && $values.length >= maxLength) return;
    const clipboardContents = e.clipboardData.getData('text/plain');
    let newValues = clipboardContents
      .split(',')
      .map((content) => content.trim());

    if (maxLength) {
      newValues = newValues.slice(0, maxLength - $values.length);
    }

    values.update((previous) => [...previous, ...newValues]);
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

<div
  class={merge(
    'group flex flex-col gap-1',
    disabled && 'cursor-not-allowed',
    className,
  )}
>
  <Label {required} {label} {disabled} hidden={labelHidden} for={id} />
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
      maxlength={maxLength && $values.length >= maxLength ? 0 : undefined}
    />
  </div>

  {#if (invalid && hintText) || (maxLength && !disabled)}
    <div class="flex justify-between gap-2">
      <div
        class="error-msg"
        class:min-width={maxLength}
        aria-live={invalid ? 'assertive' : 'off'}
      >
        {#if invalid && hintText}
          <p>{hintText}</p>
        {/if}
      </div>
      {#if maxLength && !disabled}
        <span class="count">
          <span
            class="text-information"
            class:warn={maxLength - $values?.length <= 5}
            class:error={maxLength === $values?.length}
          >
            {$values?.length ?? 0}
          </span>&nbsp;/&nbsp;{maxLength}
        </span>
      {/if}
    </div>
  {/if}

  {#if $values.length > 0 && external}
    <div class="flex flex-row flex-wrap gap-1">
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
