<div class="card bg-white {$$props.class}">
  <slot />
</div>

<style lang="postcss">
  .card {
    @apply rounded-xl border-2 border-gray-900 p-5;
  }
</style>
