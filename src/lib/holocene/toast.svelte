<script lang="ts">
  import { fly } from 'svelte/transition';
  import type { ToastVariant } from './toaster.svelte';
  import { createEventDispatcher } from 'svelte';
  import IconButton from './icon-button.svelte';

  const dispatch = createEventDispatcher<{ dismiss: { id: string } }>();

  export let id: string;
  export let variant: ToastVariant;

  const handleDismiss = () => {
    dispatch('dismiss', { id });
  };
</script>

<article
  {id}
  class="flex grow-0 items-center justify-between gap-4 rounded py-3 px-4 shadow {variant}"
  transition:fly={{ x: 250 }}
>
  <p class="font-secondary text-sm">
    <slot />
  </p>
  <IconButton icon="close" on:click={handleDismiss} />
</article>

<style lang="postcss">
  .primary {
    @apply bg-primary text-white;
  }

  .success {
    @apply bg-green-50 text-green-900;
  }

  .error {
    @apply bg-red-50 text-red-900;
  }

  .info {
    @apply bg-blue-50 text-blue-900;
  }

  .warning {
    @apply bg-yellow-50 text-yellow-900;
  }
</style>
