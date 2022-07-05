<script lang="ts">
  export let dark = false;
</script>

<li
  on:click
  role="menuitem"
  class:dark
  class="list-none bg-white text-gray-900 flex w-full cursor-pointer flex-row items-center {$$props.class}"
>
  <slot />
</li>

<style lang="postcss">
  .dark {
    @apply bg-primary text-white hover:bg-gray-800;
  }
</style>
