<script lang="ts">
  import { writable } from 'svelte/store';

  import { afterUpdate, onDestroy } from 'svelte';

  import Chip from '$lib/holocene/chip.svelte';

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
  const values = writable<string[]>(chips);
  let displayValue = '';
  let shouldScrollToInput = false;
  let inputContainer: HTMLDivElement;
  let input: HTMLInputElement;

  $: invalid = $values.some((chip) => !validator(chip));

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

<div class={$$props.class}>
  <label class:required class:sr-only={labelHidden} for={id}>{label}</label>
  <div bind:this={inputContainer} class="input-container" class:invalid>
    {#if $values.length > 0}
      {#each $values as chip, i (`${chip}-${i}`)}
        {@const valid = validator(chip)}
        <Chip
          removeButtonLabel={typeof removeChipButtonLabel === 'string'
            ? removeChipButtonLabel
            : removeChipButtonLabel(chip)}
          on:remove={() => removeChip(i)}
          intent={valid ? 'default' : 'warning'}>{chip}</Chip
        >
      {/each}
    {/if}
    <input
      data-lpignore="true"
      autocomplete="off"
      {disabled}
      {placeholder}
      {id}
      {name}
      {required}
      multiple
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
</div>

<style lang="postcss">
  label {
    @apply mb-10 text-sm font-medium text-primary;
  }

  label.required {
    @apply after:content-["*"];
  }

  .input-container {
    @apply surface-primary flex max-h-20 min-h-[2.5rem] w-full flex-row flex-wrap gap-1 overflow-y-scroll rounded border  p-2 text-sm text-primary focus-within:border-blue-700;

    .invalid {
      @apply border-red-700;
    }
  }

  input {
    @apply surface-primary inline-block w-full rounded focus:outline-none;
  }

  .hint {
    @apply text-xs text-red-700;
  }
</style>
