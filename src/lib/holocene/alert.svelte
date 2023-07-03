<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  
  import Icon from '$lib/holocene/icon/icon.svelte';
  
  import type { IconName } from './icon/paths';

  interface $$Props extends HTMLAttributes<HTMLDivElement> {
    intent: 'warning' | 'error' | 'success' | 'info';
    title?: string;
    icon?: IconName;
    bold?: boolean;
    'data-testid'?: string;
  }

  export let intent: 'warning' | 'error' | 'success' | 'info';
  export let title = '';
  export let icon: IconName = null;
  export let bold = false;

  let className = '';
  export { className as class };
</script>

<div
  class="alert {intent} {className}"
  class:bold
  role="alert"
  {...$$restProps}
>
  {#if icon}
    <div>
      <Icon name={icon} />
    </div>
  {/if}
  <div class="ml-1">
    <h5 class="font-semibold leading-6" class:hidden={!title}>
      {title}
    </h5>
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

  .alert.bold {
    @apply rounded-xl border-2;
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
    @apply border-yellow-700 bg-yellow-50 text-yellow-700;
  }

  .content :global(> *) {
    @apply font-secondary text-sm font-normal;
  }
</style>
