<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { scale } from 'svelte/transition';
  import IconButton from '$lib/holocene/icon-button.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { noop } from 'svelte/internal';
  import Tooltip from '$lib/holocene/tooltip.svelte';

  export let value: string | undefined;
  export let icon: IconName | undefined = undefined;
  export let left = false;
  export let right = false;
  export let keepOpen = false;
  export let disabled = false;
  export let disabledText = 'Disabled';

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

  const dispatch = createEventDispatcher();
  const onClick = () => {
    show = !show;
    dispatch('showmenu', {
      show,
    });
  };
</script>

<Tooltip text={disabledText} top hide={!disabled}>
  <div class="relative inline" bind:this={menu} data-cy={$$props.dataCy}>
    <IconButton
      on:click={disabled ? noop : onClick}
      dataCy="{$$props.dataCy}-button"
    >
      <div class="inline flex items-center gap-1 truncate" class:disabled>
        <slot name="label" />
        <Icon
          name={icon ? icon : show ? 'chevron-up' : 'chevron-down'}
          class="pointer-events-none"
          width={20}
          height={20}
        />
      </div>
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
      <span in:scale={{ duration: 200, start: 0.65 }} class="dot" />
    {/if}
  </div>
</Tooltip>

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

  .dot {
    @apply pointer-events-none absolute top-0 -right-1 h-2 w-2 rounded-full bg-blue-300;
  }

  .disabled {
    @apply cursor-not-allowed;
  }
</style>
