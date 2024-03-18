<script lang="ts">
  import { fly } from 'svelte/transition';

  import { createEventDispatcher } from 'svelte';

  import type { ToastVariant } from '$lib/types/holocene';

  import IconButton from './icon-button.svelte';

  const dispatch = createEventDispatcher<{ dismiss: { id: string } }>();

  export let id: string;
  export let variant: ToastVariant;
  export let closeButtonLabel: string;

  const handleDismiss = () => {
    dispatch('dismiss', { id });
  };
</script>

<div
  {id}
  class="flex grow-0 items-center justify-between gap-4 rounded px-4 py-3 shadow {variant}"
  transition:fly={{ x: 250 }}
>
  <p class="font-secondary text-sm">
    <slot />
  </p>
  <IconButton label={closeButtonLabel} icon="close" on:click={handleDismiss} />
</div>

<style lang="postcss">
  .primary {
    @apply bg-primary text-white dark:bg-inverse;
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
