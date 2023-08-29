<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import Icon from '$lib/holocene/icon/icon.svelte';

  export let intent: 'warning' | 'default' = 'default';
  export let button = false;
  export let removeButtonLabel: string;

  const dispatch = createEventDispatcher();

  const handleRemove = (e: Event) => {
    e.preventDefault();
    dispatch('remove');
  };
</script>

<span class="chip {intent}">
  {#if button}
    <button class="flex items-center gap-1" on:click>
      <slot />
    </button>
  {:else}
    <slot />
  {/if}
  <button
    aria-label={removeButtonLabel}
    on:click={handleRemove}
  >
  <Icon name="close" />
</button>
</span>

<style lang="postcss">
  .chip {
    @apply flex w-fit min-w-fit h-8 flex-row items-center justify-between break-all whitespace-nowrap rounded-md border border-gray-300 bg-gray-50 p-1 text-sm gap-1 text-gray-700;

    :global(.icon-button) {
      @apply ml-1 h-auto w-fit;
    }
  }

  .warning {
    @apply border-red-700 bg-red-50 text-red-700;
  }
</style>
