<script lang="ts">
  export let error: boolean = false;
</script>

<div class="panel bg-white {$$props.class}" class:error>
  <slot />
</div>

<style lang="postcss">
  .panel {
    @apply rounded-xl border-2 border-gray-900 p-8;
  }

  .error {
    @apply border-red-700 bg-red-50;
  }
</style>
