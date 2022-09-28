<script lang="ts">
  import { onMount } from 'svelte';
  import { scale } from 'svelte/transition';
  import IconButton from '$holocene/icon-button.svelte';
  import Icon from '$holocene/icon/icon.svelte';

  export let value: string | undefined;
  export let left = false;
  export let right = false;
  export let size: 'default' | 'small' = 'default';
  export let dropdownWidth = '';
  export let keepOpen = false;

  let show: boolean = false;
  let menu: any = null;

  $: {
    // Close the menu any time the value changes
    if ((value || !value) && !keepOpen) {
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

<div
  class="relative inline"
  class:default={size === 'default'}
  class:small={size === 'small'}
  bind:this={menu}
  data-cy={$$props.dataCy}
>
  <IconButton
    {size}
    on:click={() => (show = !show)}
    dataCy="{$$props.dataCy}-button"
  >
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
      class="dot"
      class:dot-default={size === 'default'}
      class:dot-small={size === 'small'}
    />
  {/if}
</div>

<style lang="postcss">
  .dropdown-menu {
    @apply absolute z-50 mt-1 w-auto
        rounded border border-gray-900 bg-white py-2 text-gray-900 shadow-md;
  }
  .dropdown-menu.left {
    @apply absolute left-0 origin-top-left;
  }
  .dropdown-menu.right {
    @apply absolute right-0 origin-top-right;
  }

  .default {
    @apply h-8;
  }
  .small {
    @apply h-4;
  }

  .dot {
    @apply pointer-events-none absolute h-2 w-2 rounded-full border border-blue-400 bg-blue-200;
  }

  .dot-default {
    @apply right-2 top-0;
  }

  .dot-small {
    @apply -right-1 -top-[1px];
  }
</style>
