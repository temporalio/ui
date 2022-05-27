<script lang="ts">
  import DataEncoderStatus from '$lib/components/data-encoder-status.svelte';
  import FeedbackButton from '$lib/components/feedback-button.svelte';

  export let href: string;
  export let user: User;
</script>

<header class="navigation-header" data-cy="navigation-header">
  <div class="col-span-3 flex items-center gap-4">
    <a {href} class="block">
      <img src="/logo.svg" alt="Temporal Logo" class="max-h-10" />
    </a>
    <slot name="logo" />
  </div>
  <div class="col-span-4 flex gap-4">
    <slot name="links" />
  </div>
  <div class="col-span-5 col-end-13 flex items-center justify-end gap-4">
    {#if user}
      <DataEncoderStatus />
    {/if}
    <FeedbackButton />
    <slot name="user" />
  </div>
</header>

<style lang="postcss">
  .navigation-header {
    @apply hidden h-16 grid-cols-12 grid-rows-1 items-center gap-6 bg-gray-900 px-10 shadow-lg xl:grid;
  }
</style>
