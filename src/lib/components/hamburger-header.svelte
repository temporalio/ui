<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';

  import { fly } from 'svelte/transition';

  import { hasKeys } from '$lib/utilities/has';
  import { publicPath } from '$lib/utilities/get-public-path';

  import DataEncoderStatus from '$lib/components/data-encoder-status.svelte';
  import FeedbackButton from '$lib/components/feedback-button.svelte';

  export let href: string;
  export let user: User;

  $: open = false;
</script>

<header class="hamburger-header" data-cy="hamburger-header">
  <div class="col-span-4 flex justify-start gap-4">
    <div on:click={() => (open = !open)} data-cy="hamburger-icon">
      <Icon
        class="cursor-pointer text-white"
        name={open ? 'nav-collapse' : 'nav-expand'}
      />
    </div>
  </div>
  <div class="col-span-4 flex justify-center gap-4">
    <a {href} class="block">
      <img src="{publicPath}/logo.svg" alt="Temporal Logo" class="max-h-10" />
    </a>
  </div>
  <div class="col-span-4 flex items-center justify-end gap-4">
    {#if hasKeys(user)}
      <DataEncoderStatus />
    {/if}
  </div>
</header>
{#if open}
  <section
    in:fly={{ x: -50, duration: 250 }}
    out:fly={{ x: -50, duration: 250, delay: 100 }}
    class="hamburger-menu"
  >
    <div class="relative h-full">
      <div class="action w-5/6 md:w-2/3 lg:w-1/2">
        <slot name="action" />
      </div>
      <div class="links mt-4 inline-block">
        <slot name="links" />
      </div>
      <div class="absolute left-0 bottom-24">
        <FeedbackButton />
        <slot name="user" />
      </div>
    </div>
  </section>
{/if}

<style lang="postcss">
  .hamburger-header {
    @apply fixed top-0 left-0 right-0 z-50 grid h-16 grid-cols-12 grid-rows-1 items-center gap-6 bg-gray-900 px-10 py-2 shadow-lg xl:hidden;
  }
  .hamburger-header img {
    user-select: none;
  }

  .hamburger-menu {
    @apply fixed top-16 left-0 bottom-0 z-50 w-2/3 bg-gray-900 p-4 xl:hidden;
  }
</style>
