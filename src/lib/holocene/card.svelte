<div class="card surface-primary {$$props.class}">
  <slot />
</div>

<style lang="postcss">
  .card {
    @apply rounded-xl border-2 border-slate-900 p-5;
  }
</style>
