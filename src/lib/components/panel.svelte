<script lang="ts">
  export let error = false;
</script>

<div class="panel surface-primary {$$props.class}" class:error>
  <slot />
</div>

<style lang="postcss">
  @reference "tailwindcss";

  .panel {
    @apply dark:border-subtle border p-8;

    &.error {
      @apply border-danger bg-danger;
    }
  }
</style>
