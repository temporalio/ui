<script lang="ts">
  import Chip from '$holocene/chip.svelte';

  export let id: string;
  export let value: string;
  export let label = '';
  export let placeholder = '';
  export let name = id;
  export let disabled = false;
  export let required = false;
  export let hintText = '';
  export let validator: (value: string) => boolean = () => true;

  let chips: string[] = [];
  let displayValue: string = '';

  $: invalid = false;
  $: {
    invalid = chips.some((chip) => !validator(chip));
    value = chips.join(',');
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      chips = [...chips, displayValue];
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
    const clipboardContents = e.clipboardData.getData('text/plain');
    value = clipboardContents;
    chips = [...chips, ...clipboardContents.split(',')];
  };

  const removeChip = (index: number) => {
    chips.splice(index, 1);
    chips = chips;
  };
</script>

<div class={$$props.class}>
  {#if label}
    <label class:required for={id}>{label}</label>
  {/if}
  <div class="input-container" class:invalid>
    {#if chips.length > 0}
      {#each chips as chip, i (`${chip}-${i}`)}
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
      bind:value={displayValue}
      on:keydown={handleKeydown}
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
    @apply text-sm font-medium text-gray-900 after:content-['*'];
  }

  .input-container {
    @apply flex max-h-20 w-full flex-row flex-wrap gap-1 overflow-y-scroll rounded border border-gray-900 bg-white p-2 text-sm text-gray-900 focus-within:border-blue-700;
  }

  .input-container.invalid {
    @apply border-red-700;
  }

  input {
    @apply inline-block w-full rounded bg-white bg-white focus:outline-none;
  }

  .hint {
    @apply text-xs text-red-700;
  }
</style>
