<script>import { createEventDispatcher } from 'svelte';
import IconButton from './icon-button.svelte';
import Icon from '$holocene/icon/icon.svelte';
export let intent = 'default';
const dispatch = createEventDispatcher();
const handleRemove = () => {
    dispatch('remove');
};
</script>

<span class="chip {intent}">
  <slot />
  <IconButton on:click={handleRemove}>
    <Icon class="h-4 w-4" name="close" />
  </IconButton>
</span>

<style>
  .chip {

    display: flex;

    width: -webkit-fit-content;

    width: -moz-fit-content;

    width: fit-content;

    min-width: -webkit-fit-content;

    min-width: -moz-fit-content;

    min-width: fit-content;

    flex-direction: row;

    align-items: center;

    justify-content: space-between;

    word-break: break-all;

    border-radius: 0.25rem;

    border-width: 1px;

    --tw-border-opacity: 1;

    border-color: rgb(228 228 231 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(228 228 231 / var(--tw-bg-opacity));

    padding: 0.25rem;

    font-family: Poppins, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

    font-size: 0.875rem;

    line-height: 1.25rem;

    font-weight: 600;

    --tw-text-opacity: 1;

    color: rgb(24 24 27 / var(--tw-text-opacity))
}

    .chip :global(.icon-button) {

    margin-left: 0.25rem;

    height: auto;

    width: -webkit-fit-content;

    width: -moz-fit-content;

    width: fit-content
}

  .warning {

    --tw-border-opacity: 1;

    border-color: rgb(185 28 28 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(254 242 242 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(185 28 28 / var(--tw-text-opacity))
}</style>
