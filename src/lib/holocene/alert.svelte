<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';
  import type { IconName } from './icon/paths';

  export let intent: 'warning' | 'error' | 'success' | 'info';

  export let title: string;
  export let icon: IconName | undefined = undefined;
</script>

<div class="alert {intent} {$$props.class}">
  {#if icon}
    <div>
      <Icon name={icon} />
    </div>
  {/if}
  <div class="ml-1">
    <h5 class="font-semibold">{title}</h5>
    {#if $$slots.default}
      <div class="content">
        <slot />
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
  .alert {
    @apply flex rounded-md border p-5 font-secondary text-sm;
  }

  .alert.success {
    @apply border-green-600 bg-green-100 text-green-700;
  }

  .alert.info {
    @apply border-blue-700 bg-blue-50 text-blue-700;
  }

  .alert.error {
    @apply border-red-700 bg-red-100 text-red-700;
  }

  .alert.warning {
    @apply border-yellow-700 bg-yellow-100 text-yellow-700;
  }

  .content :global(> *) {
    @apply font-secondary text-sm font-normal;
  }
</style>
