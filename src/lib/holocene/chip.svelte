<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';

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

<span class={merge('chip', intent)}>
  {#if button}
    <button
      class="flex items-center gap-1"
      data-track-name="chip"
      data-track-intent="action"
      data-track-text="*textContent*"
      {onclick}
    >
      {@render children?.()}
    </button>
  {:else}
    {@render children?.()}
  {/if}
  <button
    aria-label={removeButtonLabel}
    class={disabled ? 'hidden' : ''}
    data-track-name="chip"
    data-track-intent="remove"
    data-track-text={removeButtonLabel}
    onclick={handleRemove}
  >
    <Icon name="close" />
  </button>
</span>

<style lang="postcss">
  .chip {
    @apply surface-subtle flex h-7 w-fit min-w-fit flex-row items-center justify-between gap-1 whitespace-nowrap break-all rounded-sm p-1.5 text-sm;

    :global(.icon-button) {
      @apply ml-1 h-auto w-fit;
    }
  }

  .warning {
    @apply bg-danger;
  }
</style>
