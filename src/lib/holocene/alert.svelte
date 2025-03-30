<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';

  import type { IconName } from './icon';

  type Intent =
    | 'warning'
    | 'error'
    | 'success'
    | 'info'
    | 'nexus'
    | 'transcoder-error';
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
  <Icon name={icon} class="mt-0.5 shrink-0" />
  <div class="w-full min-w-0 gap-1">
    <p class="font-medium">
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
    @apply items-start gap-2 break-words border p-5 text-sm text-primary;
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
    @apply text-sm font-normal;
  }
</style>
