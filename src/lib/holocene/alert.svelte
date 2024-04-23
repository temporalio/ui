<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';

  import type { IconName } from './icon';

  interface $$Props extends HTMLAttributes<HTMLDivElement> {
    intent: typeof intent;
    title?: string;
    icon?: IconName;
    bold?: boolean;
    'data-testid'?: string;
    hidden?: boolean;
  }

  export let intent: 'warning' | 'error' | 'success' | 'info';
  export let title = '';
  export let icon: IconName = null;
  export let bold = false;
  export let hidden = false;

  let className = '';
  export { className as class };

  $: role = getRole(intent);

  function getRole(
    alertIntent: typeof intent,
  ): HTMLAttributes<HTMLDivElement>['role'] {
    if (alertIntent === 'error') {
      return 'alert';
    }

    if (alertIntent === 'success' || alertIntent === 'warning') {
      return 'status';
    }

    return null;
  }
</script>

<div
  class={merge('alert flex', intent, className)}
  class:bold
  class:hidden
  {role}
  {...$$restProps}
>
  {#if icon}
    <div class="pt-1">
      <Icon name={icon} />
    </div>
  {/if}
  <div class="ml-1">
    <p class="font-semibold leading-6" class:hidden={!title}>
      {title}
    </p>
    {#if $$slots.default}
      <div class="content">
        <slot />
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
  .alert {
    @apply rounded-md border-2 p-5 font-primary text-sm text-primary;
  }

  .alert.bold {
    @apply rounded-xl;
  }

  .alert.success {
    @apply border-success bg-success;
  }

  .alert.info {
    @apply border-information bg-information;
  }

  .alert.error {
    @apply border-error bg-error;
  }

  .alert.warning {
    @apply border-warning bg-warning;
  }

  .content :global(> *) {
    @apply font-secondary text-sm font-normal;
  }
</style>
