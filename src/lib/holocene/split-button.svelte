<script lang="ts">
  import { fly } from 'svelte/transition';
  import { clickOutside } from '$holocene/outside-click';
  import Icon from '$holocene/icon/index.svelte';
  export let label: string;
  export let disabled: boolean = false;
  export let left: boolean = false;
  export let right: boolean = false;

  let showDropdown: boolean = false;
  const handleClick = () => {
    if (!disabled) {
      showDropdown = !showDropdown;
    }
  };
</script>

<div
  class="relative inline-block"
  on:click={handleClick}
  use:clickOutside
  on:click-outside={() => (showDropdown = false)}
>
  <div class="split-button" class:disabled>
    <button {disabled} class="segment px-4 rounded-l">
      {label}
    </button>
    <div class="segment px-2 rounded-r">
      <Icon stroke="currentcolor" name="caretDown" />
    </div>
  </div>
  {#if showDropdown}
    <div
      in:fly={{ duration: 100 }}
      out:fly={{ duration: 100 }}
      class="dropdown"
      class:left
      class:right
    >
      <slot />
    </div>
  {/if}
</div>

<style lang="postcss">
  .split-button {
    @apply font-poppins cursor-pointer flex grow flex-row gap-[1px];
  }

  .right {
    @apply origin-top-right right-0;
  }

  .left {
    @apply origin-top-left left-0;
  }

  .split-button.disabled {
    @apply cursor-default;
  }

  .split-button.disabled .segment {
    @apply bg-gray-500;
  }

  .segment {
    @apply text-sm text-white bg-gray-900 py-2 shadow inline-block;
  }

  .dropdown {
    @apply min-w-max font-poppins text-sm absolute z-50 flex flex-col gap-y-4  bg-white rounded-lg shadow border border-gray-300 p-6 mt-1;
  }
</style>
