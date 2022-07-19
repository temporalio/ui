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
    @apply w-fit min-w-fit flex flex-row items-center justify-between border border-gray-200 bg-gray-200 text-primary rounded font-secondary font-semibold text-sm p-1 break-all;

    :global(.icon-button) {
      @apply ml-1 w-fit h-auto w-auto;
    }
  }

  .warning {
    @apply bg-red-50 border-red-700 text-red-700;
  }
</style>
