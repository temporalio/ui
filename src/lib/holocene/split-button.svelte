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
    <button {disabled} class="segment rounded-l px-4">
      {label}
    </button>
    <div class="segment rounded-r px-2">
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
    @apply flex grow cursor-pointer flex-row gap-[1px] font-poppins;
  }

  .right {
    @apply right-0 origin-top-right;
  }

  .left {
    @apply left-0 origin-top-left;
  }

  .split-button.disabled {
    @apply cursor-default;
  }

  .split-button.disabled .segment {
    @apply bg-gray-500;
  }

  .segment {
    @apply inline-block bg-gray-900 py-2 text-sm text-white shadow;
  }

  .dropdown {
    @apply absolute z-50 mt-1 flex min-w-max flex-col gap-y-4 rounded-lg  border border-gray-300 bg-white p-6 font-poppins text-sm shadow;
  }
</style>
