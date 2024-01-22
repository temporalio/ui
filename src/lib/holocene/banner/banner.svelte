<script lang="ts" context="module">
  import { persistStore } from '$lib/stores/persist-store';
  export const bannerClosed = persistStore<boolean>('bannerClosed', false);
</script>

<script lang="ts">
  import IconButton from '$lib/holocene/icon-button.svelte';

  export let message: string;
  export let closeLabel: string;

  $: show = message && !$bannerClosed;
</script>

{#if show}
  <section class="banner" {...$$restProps}>
    {message}
    <IconButton
      on:click={() => ($bannerClosed = true)}
      data-testid="close-banner"
      class="text-black-600 absolute top-0 right-0 mr-5 h-10 w-10"
      icon="close"
      label={closeLabel}
    />
  </section>
{/if}

<style lang="postcss">
  .banner {
    @apply relative block flex items-center justify-center bg-indigo-200 text-center leading-10 text-indigo-900;
  }
</style>
