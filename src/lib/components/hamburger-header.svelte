<script lang="ts">
  import Icon from 'svelte-fa';
  import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

  import { fly } from 'svelte/transition';

  import DataEncoderStatus from '$lib/components/data-encoder-status.svelte';
  import FeedbackButton from '$lib/components/feedback-button.svelte';

  export let href: string;
  export let user: User;

  $: open = false;
</script>

<header class="hamburger-header" data-cy="hamburger-header">
  <div class="flex gap-4 col-span-4 justify-start">
    <div on:click={() => (open = !open)} data-cy="hamburger-icon">
      <Icon
        class="cursor-pointer"
        icon={open ? faTimes : faBars}
        color="white"
      />
    </div>
  </div>
  <div class="flex gap-4 col-span-4 justify-center">
    <a {href} class="block">
      <img src="/logo.svg" alt="Temporal Logo" class="max-h-10" />
    </a>
  </div>
  <div class="flex gap-4 col-span-4 justify-end items-center">
    {#if user}
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
      <div class="w-5/6 md:w-2/3 lg:w-1/2 action">
        <slot name="action" />
      </div>
      <div class="mt-4 inline-block links">
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
    @apply fixed top-0 left-0 right-0 z-50 grid xl:hidden grid-rows-1 grid-cols-12 h-16 px-10 items-center bg-gray-900 shadow-lg gap-6 py-2;
  }
  .hamburger-header img {
    user-select: none;
  }

  .hamburger-menu {
    @apply fixed top-16 left-0 xl:hidden z-50 bg-gray-900 w-2/3 bottom-0 p-4;
  }
</style>
