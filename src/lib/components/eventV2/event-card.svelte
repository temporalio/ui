<script lang="ts">
  export let expanded = false;
  export let thick = false;
  export let top = false;
  export let bottom = false;
</script>

<div
  class="card {$$props.class}"
  class:shadow={thick}
  class:top
  class:bottom
  class:expanded={thick && expanded}
>
  <slot />
</div>

<style lang="postcss">
  .card {
    @apply relative select-none rounded-xl bg-white border-3 border-gray-900 p-0;
  }

  .expanded {
    @apply bg-gray-200;
  }

  .top {
    @apply rounded-t-none;
  }

  .bottom {
    @apply rounded-b-none;
  }

  .shadow {
    box-shadow: 0 6px 1px -1px #18181b;
  }
</style>
