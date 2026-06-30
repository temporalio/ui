<script lang="ts">
  import { cva } from 'class-variance-authority';

  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ComputeStatus } from '$lib/types/deployments';
  import type { ConnectionState } from '$lib/utilities/connection-status';
  import {
    deriveConnectionStatus,
    formatConnectionCheckTime,
  } from '$lib/utilities/connection-status';

  interface Props {
    computeStatus?: ComputeStatus;
  }
  let { computeStatus }: Props = $props();

  const state = $derived(deriveConnectionStatus(computeStatus));

  const connectionLabel = cva([], {
    variants: {
      state: {
        connected: 'text-green-600 dark:text-green-400',
        failed: 'text-red-600 dark:text-red-400',
        pending: 'text-secondary',
      },
    },
  });

  const dotClass: Record<ConnectionState, string> = {
    connected: 'bg-green-500',
    failed: 'bg-red-500',
    pending: 'bg-gray-400',
  };

  const tooltipText = $derived.by((): string => {
    if (state === 'pending') {
      return translate('deployments.connection-tooltip-pending');
    }
    const time = formatConnectionCheckTime(
      computeStatus?.providerValidation?.lastCheckTime,
    );
    if (state === 'connected') {
      return translate('deployments.connection-tooltip-connected', { time });
    }
    const errorMessage = computeStatus?.providerValidation?.errorMessage ?? '';
    return (
      (errorMessage ? `${errorMessage}. ` : '') +
      translate('deployments.connection-tooltip-failed-checked', { time })
    );
  });

  const labelText = $derived.by((): string => {
    if (state === 'connected')
      return translate('deployments.connection-connected');
    if (state === 'failed') return translate('deployments.connection-failed');
    return translate('deployments.connection-pending');
  });
</script>

<Tooltip text={tooltipText} topLeft width={250} usePortal>
  <p class="flex items-center justify-center gap-1 px-1 transition-colors">
    <span class="size-2 rounded-full {dotClass[state]}"></span>
    <span class={connectionLabel({ state })}>{labelText}</span>
  </p>
</Tooltip>
