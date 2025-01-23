<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';

  import type { IconName } from './icon';

  type Intent = 'warning' | 'error' | 'success' | 'info' | 'nexus';
  type AlertIcon = Extract<IconName, Intent>;

  interface Props extends HTMLAttributes<HTMLDivElement> {
    intent: Intent;
    title?: string;
    icon?: AlertIcon;
    hidden?: boolean;
    class?: string;
  }

  let {
    intent,
    title = '',
    icon = intent,
    hidden = false,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

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

  let role = $derived(getRole(intent));
</script>

<div
  class={merge('alert flex', intent, className)}
  class:hidden
  {role}
  {...rest}
>
  <Icon name={icon} class="mt-0.5" />
  <div class="w-full min-w-0 gap-1">
    <p class="font-medium">
      {title}
    </p>
    {#if children}
      <div class="content">
        {@render children()}
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
