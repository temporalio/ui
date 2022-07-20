<script lang="ts">
  export let dark = false;
  export let selected = false;
</script>

<li
  on:click
  role="menuitem"
  class:dark
  class:selected
  class="flex w-full cursor-pointer list-none flex-row items-center bg-white text-gray-900 {$$props.class}"
>
  <slot />
</li>

<style lang="postcss">
  .dark {
    @apply bg-primary text-white hover:bg-gray-800;
  }

  .selected {
    @apply bg-gray-50;
  }
</style>
