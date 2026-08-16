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
      'flex min-h-5 min-w-24 items-center justify-center gap-1 rounded-control border border-l-2 px-1.5 py-0.5 text-xs font-medium transition-colors duration-fast ease-standard',
    ],
    {
      variants: {
        status: {
          Latest: 'border-subtle bg-subtle text-secondary',
          Ramping: 'border-information bg-information text-information',
          Current: 'border-information bg-information text-information',
          Draining: 'border-warning bg-warning text-warning',
          Drained: 'border-subtle bg-subtle text-secondary',
          Inactive: 'border-subtle bg-subtle text-secondary',
          Created: 'border-information bg-information text-information',
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
