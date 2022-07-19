<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import IconButton from './icon-button.svelte';
  import Icon from './icon/index.svelte';

  export let intent: 'warning' | 'default' = 'default';

  const dispatch = createEventDispatcher();

  const handleRemove = () => {
    dispatch('remove');
  };
</script>

<span class="chip {intent}">
  <slot />
  <IconButton on:click={handleRemove}>
    <Icon class="h-4 w-4" stroke="currentcolor" name="close" strokeWidth={2} />
  </IconButton>
</span>

<style lang="postcss">
  .chip {
    @apply flex w-fit min-w-fit flex-row items-center justify-between break-all rounded border border-gray-200 bg-gray-200 p-1 font-secondary text-sm font-semibold text-primary;

    :global(.icon-button) {
      @apply ml-1 h-auto w-fit w-auto;
    }
  }

  .warning {
    @apply border-red-700 bg-red-50 text-red-700;
  }
</style>
