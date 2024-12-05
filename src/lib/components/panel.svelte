<script lang="ts">
  export let error = false;
</script>

<div class="panel surface-primary {$$props.class}" class:error>
  <slot />
</div>

<style lang="postcss">
  .panel {
    @apply rounded-xl border p-8 dark:border-subtle;

    &.error {
      @apply border-danger bg-danger;
    }
  }
</style>
