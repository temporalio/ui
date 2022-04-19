<script lang="ts">
  export let href: string;
  export let active = false;
</script>

<a
  {href}
  class:active
  {...$$props}
  class="border-b-0 md:border-b-2  border-blue-600 {$$props.class} hover:text-blue-900 hover:no-underline"
>
  <slot />
</a>

<style lang="postcss">
  .active {
    @apply text-blue-700 border-b-2 border-blue-600;
  }
</style>
