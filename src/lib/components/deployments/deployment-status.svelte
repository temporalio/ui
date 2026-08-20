<script lang="ts">
  import { cva } from 'class-variance-authority';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { DeploymentStatus } from '$lib/types/deployments';

  interface Props {
    status: DeploymentStatus;
    label: string;
  }
  let { status, label }: Props = $props();

  const icon: Partial<Record<DeploymentStatus, IconName>> = {
    Current: 'heartbeat',
    Ramping: 'trending-up',
    Draining: 'trending-down',
    Drained: 'drained',
    Inactive: 'inactive',
    Created: 'add',
  };

  const tooltip: Partial<Record<DeploymentStatus, string>> = {
    Current: translate('deployments.status-tooltip-current'),
    Ramping: translate('deployments.status-tooltip-ramping'),
    Draining: translate('deployments.status-tooltip-draining'),
    Drained: translate('deployments.status-tooltip-drained'),
    Inactive: translate('deployments.status-tooltip-inactive'),
    Created: translate('deployments.status-tooltip-created'),
  };

  const deploymentStatus = cva(
    [
      'flex items-center justify-center gap-1 px-1 min-w-24 transition-colors border border-io-border-primary',
    ],
    {
      variants: {
        status: {
          Latest: 'text-io-content-secondary',
          Ramping: 'text-io-content-brand',
          Current: 'text-io-content-information',
          Draining: 'text-io-content-warning',
          Drained: 'text-io-content-secondary',
          Inactive: 'text-io-content-secondary',
          Created: 'text-io-content-secondary',
        },
      },
    },
  );
</script>

<Tooltip text={tooltip[status]} topLeft width={250} usePortal>
  <p class={deploymentStatus({ status })}>
    {#if icon[status]}<Icon name={icon[status]!} />{/if}{label}
  </p>
</Tooltip>
