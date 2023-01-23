<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let dark = false;
  export let selected = false;
  export let destructive = false;
  export let active = false;
  export let disabled = false;
  export let href = '';
  export let dataCy: string = null;

  const dispatch = createEventDispatcher<{ click: undefined }>();

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === ' ' || event.key === 'Enter') {
      dispatch('click');
    }
  };
</script>

<div class="menu-item-wrapper" class:disabled>
  {#if href}
    <a
      {href}
      role="menuitem"
      tabindex="0"
      class:dark
      class:destructive
      class:selected
      class:active
      data-cy={dataCy}
      class="menu-item inline-block {$$props.class}"
    >
      <slot />
    </a>
  {:else}
    <li
      on:click|preventDefault
      on:keyup={handleKeyUp}
      tabindex="0"
      role="menuitem"
      class:dark
      class:destructive
      class:selected
      class:active
      class:disabled
      data-cy={dataCy}
      class="menu-item {$$props.class}"
    >
      <slot />
    </li>
  {/if}
</div>

<style lang="postcss">
  .menu-item-wrapper.disabled {
    @apply cursor-not-allowed;
  }

  .menu-item {
    @apply w-full cursor-pointer list-none bg-white p-4 font-secondary text-sm font-medium text-primary focus-within:bg-gray-50 focus-within:outline-none hover:bg-gray-50;
  }

  .dark {
    @apply bg-primary text-white hover:bg-gray-800;

    &.selected,
    &.active {
      @apply bg-gray-800 text-blue-100;
    }
  }

  .active,
  .selected {
    @apply text-blue-700;
  }

  .destructive {
    @apply text-red-700 hover:bg-red-50;
  }

  .menu-item.disabled {
    @apply pointer-events-none text-gray-500;
  }
</style>
