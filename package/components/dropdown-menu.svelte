<script>import { onMount } from 'svelte';
import { scale } from 'svelte/transition';
import IconButton from '$holocene/icon-button.svelte';
import Icon from '$holocene/icon/icon.svelte';
export let value;
export let left = false;
export let right = false;
let show = false;
let menu = null;
$: {
    // Close the menu any time the value changes
    if (value || !value) {
        show = false;
    }
}
onMount(() => {
    const handleOutsideClick = (event) => {
        if (show && !menu.contains(event.target)) {
            show = false;
        }
    };
    const handleEscape = (event) => {
        if (show && (event === null || event === void 0 ? void 0 : event.key) === 'Escape') {
            show = false;
        }
    };
    document.addEventListener('click', handleOutsideClick, false);
    document.addEventListener('keyup', handleEscape, false);
    return () => {
        document.removeEventListener('click', handleOutsideClick, false);
        document.removeEventListener('keyup', handleEscape, false);
    };
});
</script>

<div class="relative inline" bind:this={menu} data-cy={$$props.dataCy}>
  <IconButton on:click={() => (show = !show)} dataCy="{$$props.dataCy}-button">
    <Icon name="chevron-down" width={16} height={16} />
  </IconButton>
  {#if show}
    <div
      in:scale={{ duration: 200, start: 0.65 }}
      out:scale={{ duration: 100, start: 0.65 }}
      class:left
      class:right
      class="dropdown-menu"
    >
      <div class="block gap-4">
        <slot />
      </div>
    </div>
  {/if}
  {#if value}
    <span
      in:scale={{ duration: 200, start: 0.65 }}
      out:scale={{ duration: 100, start: 0.65 }}
      class="absolute right-1 top-0 h-2 w-2 rounded-full bg-blue-200"
    />
  {/if}
</div>

<style>
  .dropdown-menu {
    position: absolute;
    z-index: 50;
    margin-top: 0.25rem;
    width: 14rem;
    border-radius: 0.25rem;
    --tw-bg-opacity: 1;
    background-color: rgb(255 255 255 / var(--tw-bg-opacity));
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    --tw-text-opacity: 1;
    color: rgb(24 24 27 / var(--tw-text-opacity));
    --tw-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --tw-shadow-colored: 0 4px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)
}
  .dropdown-menu.left {
    position: absolute;
    left: 0px;
    transform-origin: top left
}
  .dropdown-menu.right {
    position: absolute;
    right: 0px;
    transform-origin: top right
}</style>
