<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import { IconClose, IconWarning } from '$lib/io/icon';

  interface Props {
    intent?: 'warning' | 'default';
    button?: boolean;
    removeButtonLabel: string;
    disabled?: boolean;
    onclick?: () => void;
    onremove?: () => void;
    children?: Snippet;
  }

  let {
    intent = 'default',
    button = false,
    removeButtonLabel,
    disabled = false,
    onclick,
    onremove,
    children,
  }: Props = $props();

  const handleRemove = (e: Event) => {
    e.preventDefault();
    onremove?.();
  };
</script>

<span class={merge('chip', intent)} class:disabled>
  {#if intent === 'warning'}
    <IconWarning class="shrink-0" />
  {/if}
  {#if button}
    <button
      class="flex items-center gap-1"
      data-track-name="chip"
      data-track-intent="action"
      data-track-text="*textContent*"
      {disabled}
      {onclick}
    >
      {@render children?.()}
    </button>
  {:else}
    {@render children?.()}
  {/if}
  <button
    aria-label={removeButtonLabel}
    class={merge(
      'inline-flex items-center justify-center p-1',
      disabled ? 'hidden' : '',
    )}
    data-track-name="chip"
    data-track-intent="remove"
    data-track-text={removeButtonLabel}
    {disabled}
    onclick={handleRemove}
  >
    <IconClose />
  </button>
</span>

<style lang="postcss">
  .chip {
    @apply flex min-h-7 w-fit min-w-fit flex-row items-center justify-between gap-1 whitespace-nowrap break-all rounded-sm border border-secondary bg-surface-primary p-1 pl-2 text-sm leading-[1.5] text-secondary focus-within:outline-none focus-within:ring-2 focus-within:ring-interactive-primary focus-within:ring-offset-2 focus-within:ring-offset-background-primary;

    &:not(.disabled):hover {
      background-image: linear-gradient(
        var(--color-interactive-tertiary-hover),
        var(--color-interactive-tertiary-hover)
      );
    }

    &:not(.disabled):active {
      background-image: linear-gradient(
        var(--color-interactive-tertiary-press),
        var(--color-interactive-tertiary-press)
      );
    }

    &.disabled {
      @apply pointer-events-none cursor-not-allowed opacity-disabled;
    }

    :global(.icon-button) {
      @apply ml-1 h-auto w-fit;
    }
  }

  .warning {
    @apply border-warning bg-surface-warning text-warning;
  }
</style>
