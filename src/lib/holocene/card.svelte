<script lang="ts">
  import type { IconName } from './icon/paths';
  import Icon from '$holocene/icon/index.svelte';

  export let variant: 'default' | 'warning' | 'error' | 'success' | 'info' =
    'default';

  export let icon: IconName = '';
  export let title = '';
</script>

<div class="card {variant} {$$props.class}">
  <div class="flex">
    {#if icon}
      <Icon class="mr-1" name={icon} />
    {/if}
    <div>
      {#if title}
        <h5 class="font-semibold">{title}</h5>
      {/if}
      <slot />
    </div>
  </div>
</div>

<style lang="postcss">
  .card {
    @apply rounded-md border p-5 font-secondary text-sm;
  }

  .card.default {
    @apply border-gray-300 text-primary;
  }

  .card.success {
    @apply border-green-600 bg-green-100 text-green-700;
  }

  .card.info {
    @apply border-blue-700 bg-blue-50 text-blue-700;
  }

  .card.error {
    @apply border-red-700 bg-red-100 text-red-700;
  }

  .card.warning {
    @apply border-yellow-700 bg-yellow-100 text-yellow-700;
  }
</style>
