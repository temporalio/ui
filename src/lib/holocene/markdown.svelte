<script lang="ts">
  import type { HTMLTextareaAttributes } from 'svelte/elements';

  import markdownit from 'markdown-it';
  import { twMerge as merge } from 'tailwind-merge';

  import Label from './label.svelte';
  import ToggleButton from './toggle-button/toggle-button.svelte';
  import ToggleButtons from './toggle-button/toggle-buttons.svelte';

  type $$Props = HTMLTextareaAttributes & {
    disabled?: boolean;
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
  };

  export let disabled = false;
  export let placeholder = '';
  export let rows = 10;
  export let spellcheck: boolean = null;
  export let value: string;
  export let label: string;
  export let labelHidden = false;
  export let id: string;
  export let required = false;
  export let description = '';
  export let maxLength = 0;

  let className = 'text-primary';
  export { className as class };

  let preview = false;

  const md = markdownit();
  $: result = md.render(value);
</script>

<div class={className}>
  <Label {required} hidden={labelHidden} {label} for={id} />
  {#if description}
    <p class="pb-2 text-sm">{description}</p>
  {/if}
  <ToggleButtons>
    <ToggleButton active={!preview} on:click={() => (preview = false)}
      >Write</ToggleButton
    >
    <ToggleButton active={preview} on:click={() => (preview = true)}
      >Preview</ToggleButton
    >
  </ToggleButtons>
  <div class="relative mt-2">
    {#if preview}
      <div class="preview">
        {@html result}
      </div>
    {:else}
      <textarea
        bind:value
        class={merge(
          'surface-input min-h-fit w-full rounded-lg border-2 border-subtle px-3 py-2 font-mono text-sm focus-visible:border-information focus-visible:shadow-[0_0_0_4px_rgb(97,115,243,0.7)] focus-visible:outline-none enabled:hover:border-information',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        {id}
        {disabled}
        {placeholder}
        {rows}
        {spellcheck}
        on:input
        on:change
        on:focus
        on:blur
        on:keydown|stopPropagation
        maxlength={maxLength > 0 ? maxLength : undefined}
      />
      {#if maxLength && !disabled}
        <span class="count">
          <span
            class="text-blue-700"
            class:warn={maxLength - value?.length <= 5}
            class:error={maxLength === value?.length}>{value?.length ?? 0}</span
          >&nbsp;/&nbsp;{maxLength}
        </span>
      {/if}
    {/if}
  </div>
  <slot name="info" />
</div>

<style lang="postcss">
  .error {
    @apply border-danger hover:border-danger focus-visible:border-danger focus-visible:shadow-[0_0_0_4px_rgb(249,115,22,0.7)];
  }

  .count {
    @apply invisible absolute -bottom-5 right-0 font-secondary text-sm font-medium text-primary;
  }

  .count > .warn {
    @apply text-orange-600;
  }

  .count > .error {
    @apply text-red-700;
  }

  textarea:focus + .count {
    @apply visible;
  }

  textarea {
    @apply surface-inverse;
  }

  .preview {
    :global(h1) {
      @apply text-4xl;
    }

    :global(h2) {
      @apply text-3xl;
    }

    :global(h3) {
      @apply text-2xl;
    }

    :global(h4) {
      @apply text-xl;
    }

    :global(h5) {
      @apply text-lg;
    }

    :global(h6) {
      @apply text-base;
    }

    :global(ul) {
      @apply list-inside list-disc;
    }

    :global(ol) {
      @apply list-inside list-disc;
    }
  }
</style>
