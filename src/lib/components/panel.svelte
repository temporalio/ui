<script lang="ts">
  export let error: boolean = false;
</script>

<div class="panel" class:error>
  <slot />
</div>

<style lang="postcss">
  .panel {
    @apply p-8 border-2 border-gray-300 rounded-lg;
  }
  .error {
    @apply border-red-700 bg-red-50;
  }
</style>
