<script lang="ts">
  export let href: string;
  export let active = false;
</script>

<a
  {href}
  class:active
  {...$$props}
  class="border-b-2 border-gray-900 {$$props.class} hover:text-blue-700 hover:border-blue-700"
>
  <slot />
</a>

<style lang="postcss">
  .active {
    @apply text-blue-900 border-b-2 border-blue-900;
  }
</style>
