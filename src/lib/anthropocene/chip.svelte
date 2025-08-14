<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/anthropocene/icon/icon.svelte';

  interface Props {
    intent?: 'warning' | 'default';
    button?: boolean;
    removeButtonLabel: string;
    disabled?: boolean;
    children?: Snippet;
    onclick?: (e: MouseEvent) => void;
    onremove?: () => void;
  }

  let {
    intent = 'default',
    button = false,
    removeButtonLabel,
    disabled = false,
    children,
    onclick,
    onremove,
  }: Props = $props();

  const handleRemove = (e: Event) => {
    e.preventDefault();
    onremove?.();
  };
</script>

<span class={merge('chip', intent)}>
  {#if button}
    <button class="flex items-center gap-1" {onclick}>
      {#if children}{@render children()}{/if}
    </button>
  {:else if children}{@render children()}{/if}
  <button
    aria-label={removeButtonLabel}
    class:hidden={disabled}
    onclick={handleRemove}
  >
    <Icon name="close" />
  </button>
</span>

<style lang="postcss">
  .chip {
    @apply surface-subtle flex h-8 w-fit min-w-fit flex-row items-center justify-between gap-1 whitespace-nowrap break-all rounded-sm p-1 text-sm;

    :global(.icon-button) {
      @apply ml-1 h-auto w-fit;
    }
  }

  .warning {
    @apply bg-danger;
  }
</style>
