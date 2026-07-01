<script lang="ts">
  import { cva } from 'class-variance-authority';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { ComputeStatus } from '$lib/types/deployments';
  import {
    deriveConnectionStatus,
    formatConnectionCheckTime,
  } from '$lib/utilities/connection-status';

  const CONFIG: Record<string, { icon: 'aws' | 'gcp'; label: string }> = {
    'aws-lambda': { icon: 'aws', label: 'Lambda' },
    'gcp-cloud-run': { icon: 'gcp', label: 'Cloud Run' },
  };

  let {
    type,
    computeStatus,
  }: { type: string | undefined; computeStatus?: ComputeStatus } = $props();

  const config = $derived(type ? CONFIG[type] : undefined);
  const state = $derived(
    computeStatus ? deriveConnectionStatus(computeStatus) : undefined,
  );

  const connectionText = cva([], {
    variants: {
      state: {
        connected: 'text-success',
        failed: 'text-danger',
        pending: 'text-subtle',
      },
    },
  });

  const connectionLabel = $derived.by((): string => {
    if (state === 'connected')
      return translate('deployments.connection-connected');
    if (state === 'failed') return translate('deployments.connection-failed');
    return translate('deployments.connection-pending');
  });

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
</script>

{#snippet pill()}
  <div
    class="inline-flex min-w-24 items-center justify-center gap-2 border border-subtle px-1"
  >
    <Icon name={config.icon} />
    <p>{config.label}</p>
    {#if state}
      <span
        class="size-1.5 shrink-0 rounded-full bg-current {connectionText({
          state,
        })}"
      ></span>
      <span class={connectionText({ state })}>{connectionLabel}</span>
    {/if}
  </div>
{/snippet}

{#if config}
  {#if state}
    <Tooltip text={tooltipText} topLeft width={250} usePortal>
      {@render pill()}
    </Tooltip>
  {:else}
    {@render pill()}
  {/if}
{/if}
