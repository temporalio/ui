<div class="card surface-primary {$$props.class}">
  <slot />
</div>

<style lang="postcss">
  .card {
    @apply rounded-2xl border-2 border-subtle p-5;
  }
</style>
