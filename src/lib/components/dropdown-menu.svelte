<script lang="ts">
  import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
  import { onMount } from 'svelte';
  import { scale } from 'svelte/transition';
  import IconButton from './icon-button.svelte';

  export let value: string | undefined;
  export let left = false;
  export let right = false;

  let show: boolean = false;
  let menu: any = null;

  $: {
    // Close the menu any time the value changes
    if (value || !value) {
      show = false;
    }
  }

  onMount(() => {
    const handleOutsideClick = (event: Event) => {
      if (show && !menu.contains(event.target)) {
        show = false;
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (show && event?.key === 'Escape') {
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

<div class="relative inline mx-2" bind:this={menu}>
  <IconButton
    icon={faCaretDown}
    on:click={() => (show = !show)}
    classes="menu focus:outline-none focus:shadow-solid"
  />
  {#if show}
    <div
      in:scale={{ duration: 200, start: 0.65 }}
      out:scale={{ duration: 100, start: 0.65 }}
      class:left
      class:right
      class="dropdown-menu"
    >
      <div class="gap-4 block">
        <slot />
      </div>
    </div>
  {/if}
  {#if value}
    <span
      in:scale={{ duration: 200, start: 0.65 }}
      out:scale={{ duration: 100, start: 0.65 }}
      class="absolute top-0 right-3 w-2 h-2 bg-blue-200 rounded-full"
    />
  {/if}
</div>

<style lang="postcss">
  .dropdown-menu {
    @apply absolute py-2 mt-1 bg-white
        rounded shadow-md text-gray-900 w-56 z-50;
  }
  .dropdown-menu.left {
    @apply origin-top-left absolute left-0;
  }
  .dropdown-menu.right {
    @apply origin-top-right absolute right-0;
  }
</style>
