<script lang="ts">
  export let thick = false;
</script>

<div class="card bg-white {$$props.class}" class:shadow={thick}>
  <slot />
</div>

<style lang="postcss">
  .card {
    @apply relative select-none rounded-xl border-3 border-gray-900 p-0;
  }

  .shadow {
    box-shadow: 0 6px 1px -1px #18181b;
  }
</style>
