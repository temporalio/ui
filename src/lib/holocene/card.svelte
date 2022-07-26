<script lang="ts">
  export let variant: 'default' | 'warning' | 'error' | 'success' = 'default';
</script>

<div class="card {variant} {$$props.class}">
  <slot />
</div>

<style lang="postcss">
  .card {
    @apply rounded-md border p-5;
  }

  .card.default {
    @apply border-gray-300;
  }

  .card.success {
    @apply border-green-600 bg-green-100;
  }

  /* text-primary here is added because there are other error and warning classes */
  .card.error {
    @apply border-red-700 bg-red-100 text-primaryText;
  }

  .card.warning {
    @apply border-yellow-700 bg-yellow-100 text-primaryText;
  }
</style>
