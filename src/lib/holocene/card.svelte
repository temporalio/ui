<div class="card surface-primary {$$props.class}">
  <slot />
</div>

<style lang="postcss">
  @reference "tailwindcss";

  .card {
    @apply border-subtle border p-4;
  }
</style>
