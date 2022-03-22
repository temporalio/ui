<script lang="ts">
  export let href: string;
  export let active = false;

  const { class: classes, ...props } = $$props;
</script>

<a
  {href}
  class:active
  class="border-b-2 border-blue-600 {classes} hover:text-blue-900 hover:no-underline"
>
  <slot />
</a>

<style lang="postcss">
  .active {
    @apply text-blue-700 border-b-2 border-blue-600;
  }
</style>
