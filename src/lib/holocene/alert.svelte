<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
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

  interface Props extends HTMLAttributes<HTMLDivElement> {
    intent: Intent;
    title?: string;
    icon?: AlertIcon;
    'data-testid'?: string;
    hidden?: boolean;
    class?: string;
    children?: Snippet;
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

  const role = $derived(getRole(intent));

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
  {...rest}
>
  <Icon name={icon} class="mt-0.5 shrink-0" />
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
    @apply items-start gap-2 break-words border p-5 text-sm text-io-content-primary;
  }

  .alert.success {
    @apply border-io-border-success bg-io-surface-success;
  }

  .alert.info {
    @apply border-io-border-information bg-io-surface-information;
  }

  .alert.error {
    @apply border-io-border-danger bg-io-surface-danger;
  }

  .alert.warning {
    @apply border-io-border-warning bg-io-surface-warning;
  }

  .content :global(> *) {
    @apply text-sm font-normal;
  }
</style>
