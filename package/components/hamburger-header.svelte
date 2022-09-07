<script>import Icon from '$holocene/icon/icon.svelte';
import { fly } from 'svelte/transition';
import { hasKeys } from '../utilities/has';
import { publicPath } from '../utilities/get-public-path';
import DataEncoderStatus from './data-encoder-status.svelte';
import FeedbackButton from './feedback-button.svelte';
export let href;
export let user;
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

<style>
  .hamburger-header {
    position: fixed;
    top: 0px;
    left: 0px;
    right: 0px;
    z-index: 50;
    display: grid;
    height: 4rem;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-template-rows: repeat(1, minmax(0, 1fr));
    align-items: center;
    gap: 1.5rem;
    --tw-bg-opacity: 1;
    background-color: rgb(24 24 27 / var(--tw-bg-opacity));
    padding-left: 2.5rem;
    padding-right: 2.5rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}
@media (min-width: 1280px) {
    .hamburger-header {
        display: none;
    }
}
  .hamburger-header img {
    -webkit-user-select: none;
       -moz-user-select: none;
        -ms-user-select: none;
            user-select: none;
  }

  .hamburger-menu {
    position: fixed;
    top: 4rem;
    left: 0px;
    bottom: 0px;
    z-index: 50;
    width: 66.666667%;
    --tw-bg-opacity: 1;
    background-color: rgb(24 24 27 / var(--tw-bg-opacity));
    padding: 1rem;
}

  @media (min-width: 1280px) {
    .hamburger-menu {
        display: none;
    }
}</style>
