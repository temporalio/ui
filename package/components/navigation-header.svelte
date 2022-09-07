<script>import { hasKeys } from '../utilities/has';
import { publicPath } from '../utilities/get-public-path';
import DataEncoderStatus from './data-encoder-status.svelte';
import FeedbackButton from './feedback-button.svelte';
export let href;
export let user;
</script>

<header class="navigation-header" data-cy="navigation-header">
  <div class="col-span-3 flex items-center gap-4">
    <a {href} class="block">
      <img src="{publicPath}/logo.svg" alt="Temporal Logo" class="max-h-10" />
    </a>
    <slot name="logo" />
  </div>
  <div class="col-span-4 flex gap-4">
    <slot name="links" />
  </div>
  <div class="col-span-5 col-end-13 flex items-center justify-end gap-4">
    {#if hasKeys(user)}
      <DataEncoderStatus />
    {/if}
    <FeedbackButton />
    <slot name="user" />
  </div>
</header>

<style>
  .navigation-header {
    display: none;
    height: 4rem;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    grid-template-rows: repeat(1, minmax(0, 1fr));
    align-items: center;
    gap: 1.5rem;
    --tw-bg-opacity: 1;
    background-color: rgb(24 24 27 / var(--tw-bg-opacity));
    padding-left: 2.5rem;
    padding-right: 2.5rem;
    --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)
}
@media (min-width: 1280px) {
    .navigation-header {
        display: grid
    }
}</style>
