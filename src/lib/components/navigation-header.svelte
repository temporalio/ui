<script lang="ts">
  import DataConverterStatus from '$lib/components/data-converter-status.svelte';
  import FeedbackButton from '$lib/components/feedback-button.svelte';
  import LogoutButton from '$lib/components/logout-button.svelte';

  export let user: User;
  export let href: string;
</script>

<header class="navigation-header">
  <div class="flex items-center gap-4 col-span-3">
    <a {href} class="block">
      <img src="/logo.svg" alt="Temporal Logo" class="max-h-10" />
    </a>
    <slot name="logo" />
  </div>
  <div class="flex gap-4 col-span-4">
    <slot name="links" />
  </div>
  <div class="flex justify-end gap-4 col-span-5 col-end-13 items-center">
    <div class="text-right">
      <DataConverterStatus />
    </div>
    <FeedbackButton />
    <LogoutButton {user} />
  </div>
</header>

<style lang="postcss">
  .navigation-header {
    @apply hidden xl:grid grid-rows-1 grid-cols-12 px-10 items-center bg-gray-900 shadow-lg gap-6;
  }
</style>
