<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import {
    IconCheckmark,
    type IconComponent,
    IconExclamationCircle,
    IconInfo,
    IconNexus,
    IconTranscoderError,
    IconWarning,
  } from '$lib/io/icon';

  type Intent =
    | 'warning'
    | 'error'
    | 'success'
    | 'info'
    | 'nexus'
    | 'transcoder-error';
  const intentIcon: Readonly<Record<Intent, IconComponent>> = {
    warning: IconWarning,
    error: IconExclamationCircle,
    success: IconCheckmark,
    info: IconInfo,
    nexus: IconNexus,
    'transcoder-error': IconTranscoderError,
  };

  interface Props extends HTMLAttributes<HTMLDivElement> {
    intent: Intent;
    title?: string;
    Icon?: IconComponent;
    'data-testid'?: string;
    hidden?: boolean;
    class?: string;
    children?: Snippet;
  }

  let {
    intent,
    title = '',
    Icon = intentIcon[intent],
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
  <Icon class="mt-0.5 shrink-0" />
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
