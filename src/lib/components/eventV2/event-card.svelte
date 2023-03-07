<script lang="ts">
  export let thick = false;
  export let top = false;
  export let bottom = false;
</script>

<div
  class="card bg-white {$$props.class}"
  class:shadow={thick}
  class:top
  class:bottom
>
  <slot />
</div>

<style lang="postcss">
  .card {
    @apply relative select-none rounded-xl border-3 border-gray-900 p-0;
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
