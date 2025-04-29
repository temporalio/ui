<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';

  export let intent: 'warning' | 'default' = 'default';
  export let button = false;
  export let removeButtonLabel: string;
  export let disabled = false;

  const dispatch = createEventDispatcher();

  const handleRemove = (e: Event) => {
    e.preventDefault();
    dispatch('remove');
  };
</script>

<span class={merge('chip', intent)}>
  {#if button}
    <button class="flex items-center gap-1" on:click>
      <slot />
    </button>
  {:else}
    <slot />
  {/if}
  <button
    aria-label={removeButtonLabel}
    class:hidden={disabled}
    on:click={handleRemove}
  >
    <Icon name="close" />
  </button>
</span>

<style lang="postcss">
  @reference "tailwindcss";

  .chip {
    @apply surface-subtle flex h-8 w-fit min-w-fit flex-row items-center justify-between gap-1 rounded-sm p-1 text-sm break-all whitespace-nowrap;

    :global(.icon-button) {
      @apply ml-1 h-auto w-fit;
    }
  }

  .warning {
    @apply bg-danger;
  }
</style>
