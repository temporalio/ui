<script lang="ts">
  import { onDestroy, afterUpdate } from 'svelte';
  import { writable } from 'svelte/store';
  import Chip from '$lib/holocene/chip.svelte';

  export let id: string;
  export let chips: string[];
  export let label = '';
  export let placeholder = '';
  export let name = id;
  export let disabled = false;
  export let required = false;
  export let hintText = '';
  export let validator: (value: string) => boolean = () => true;
  const values = writable<string[]>(chips);
  let displayValue: string = '';
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
    if ((e.key === ',' || e.key === 'Enter') && displayValue !== '') {
      e.preventDefault();
      values.update((previous) => [...previous, displayValue]);
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
    values.update((previous) => [...previous, ...clipboardContents.split(',')]);
  };

  const handleBlur = () => {
    if (displayValue !== '') {
      values.update((previous) => [...previous, displayValue]);
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

<label class={$$props.class} for={id}>
  {#if label}
    {label}{#if required}*{/if}
  {/if}
  <div bind:this={inputContainer} class="input-container" class:invalid>
    {#if $values.length > 0}
      {#each $values as chip, i (`${chip}-${i}`)}
        {@const valid = validator(chip)}
        <Chip
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
      on:keydown={handleKeydown}
      on:paste={handlePaste}
    />
  </div>
  {#if invalid && hintText}
    <span class="hint">
      {hintText}
    </span>
  {/if}
</label>

<style lang="postcss">
  label {
    @apply mb-10 text-sm font-medium text-gray-900;
  }

  .input-container {
    @apply flex max-h-20 min-h-[2.5rem] w-full flex-row flex-wrap gap-1 overflow-y-scroll rounded border border-gray-900 bg-white p-2 text-sm text-gray-900 focus-within:border-blue-700;

    .invalid {
      @apply border-red-700;
    }
  }

  input {
    @apply inline-block w-full rounded bg-white focus:outline-none;
  }

  .hint {
    @apply text-xs text-red-700;
  }
</style>
