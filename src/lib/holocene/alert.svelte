<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';

  import type { IconName } from './icon';

  type Intent = 'warning' | 'error' | 'success' | 'info';
  type AlertIcon = Extract<IconName, Intent>;

  interface $$Props extends HTMLAttributes<HTMLDivElement> {
    intent: Intent;
    title?: string;
    icon?: AlertIcon;
    'data-testid'?: string;
    hidden?: boolean;
  }

  export let intent: Intent;
  export let title = '';
  export let icon: AlertIcon = intent;
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
  class:hidden
  {role}
  {...$$restProps}
>
  {#if icon}
    <div class="pt-1">
      <Icon name={icon} />
    </div>
  {/if}
  <div class="ml-1 grow">
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
    @apply rounded-lg border-2 p-5 font-primary text-sm text-primary;
  }

  .alert.success {
    @apply border-success bg-success;
  }

  .alert.info {
    @apply border-information bg-information;
  }

  .alert.error {
    @apply border-danger bg-danger;
  }

  .alert.warning {
    @apply border-warning bg-warning;
  }

  .content :global(> *) {
    @apply font-secondary text-sm font-normal;
  }
</style>
