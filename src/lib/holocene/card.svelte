<div class="card {$$props.class}">
  <slot />
</div>

<style lang="postcss">
  .card {
    @apply rounded-lg border border-gray-300 p-5;
  }
</style>
