<script lang="ts">
  export let dark = false;
  export let selected = false;
  export let destructive = false;
  export let active = false;
</script>

<li
  on:click
  role="menuitem"
  class:dark
  class:destructive
  class:selected
  class:active
  class="w-full cursor-pointer list-none bg-white p-2 text-sm text-primary hover:bg-gray-50 {$$props.class}"
>
  <slot />
</li>

<style lang="postcss">
  .dark {
    @apply bg-primary text-white hover:bg-gray-800;

    &.selected {
      @apply bg-gray-800;
    }
  }

  .active {
    @apply text-blue-700;
  }

  .destructive {
    @apply text-red-700 hover:bg-red-50;
  }

  .selected {
    @apply bg-gray-50;
  }
</style>
