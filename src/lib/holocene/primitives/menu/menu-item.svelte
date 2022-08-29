<script lang="ts">
  export let dark = false;
  export let selected = false;
  export let destructive = false;
  export let active = false;
  export let disabled = false;
  export let href = '';
</script>

{#if href}
  <a
    {href}
    role="menuitem"
    class:dark
    class:destructive
    class:selected
    class:active
    class:disabled
    {disabled}
    class="menu-item inline-block {$$props.class}"
  >
    <slot />
  </a>
{:else}
  <li
    on:click|preventDefault
    role="menuitem"
    class:dark
    class:destructive
    class:selected
    class:active
    class:disabled
    class="menu-item {$$props.class}"
  >
    <slot />
  </li>
{/if}

<style lang="postcss">
  .menu-item {
    @apply w-full cursor-pointer list-none bg-white p-4 font-secondary text-sm font-medium text-primary hover:bg-gray-50;
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

  .disabled {
    @apply pointer-events-none text-gray-500;
  }
</style>
