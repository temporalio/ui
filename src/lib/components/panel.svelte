<script lang="ts">
  export let error: boolean = false;
</script>

<div class="panel" class:error>
  <slot />
</div>

<style lang="postcss">
  .panel {
    @apply rounded-lg border-2 border-gray-300 p-8;
  }
  .error {
    @apply border-red-700 bg-red-50;
  }
</style>
