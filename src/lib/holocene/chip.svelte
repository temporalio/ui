<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  import Icon from '$lib/holocene/icon/icon.svelte';
  
  import IconButton from './icon-button.svelte';

  export let intent: 'warning' | 'default' = 'default';

  const dispatch = createEventDispatcher();

  const handleRemove = (e: Event) => {
    e.preventDefault();
    dispatch('remove');
  };
</script>

<span class="chip {intent}">
  <slot />
  <IconButton on:click={handleRemove}>
    <Icon class="h-4 w-4" name="close" />
  </IconButton>
</span>

<style lang="postcss">
  .chip {
    @apply flex w-fit min-w-fit flex-row items-center justify-between break-all rounded border border-gray-200 bg-gray-200 p-1 font-secondary text-sm font-semibold text-primary;

    :global(.icon-button) {
      @apply ml-1 h-auto w-fit;
    }
  }

  .warning {
    @apply border-red-700 bg-red-50 text-red-700;
  }
</style>
