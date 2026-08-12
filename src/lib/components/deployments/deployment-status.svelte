<script lang="ts">
  import { cva } from 'class-variance-authority';

  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import {
    IconAdd,
    IconArrowTrendingDown,
    IconArrowTrendingUp,
    type IconComponent,
    IconDrained,
    IconHeartbeat,
    IconInactive,
  } from '$lib/io/icon';
  import type { DeploymentStatus } from '$lib/types/deployments';

  interface Props {
    status: DeploymentStatus;
    label: string;
  }
  let { status, label }: Props = $props();

  const icon: Partial<Record<DeploymentStatus, IconComponent>> = {
    Current: IconHeartbeat,
    Ramping: IconArrowTrendingUp,
    Draining: IconArrowTrendingDown,
    Drained: IconDrained,
    Inactive: IconInactive,
    Created: IconAdd,
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
      'flex items-center justify-center gap-1 px-1 min-w-24 transition-colors border border-subtle',
    ],
    {
      variants: {
        status: {
          Latest: 'text-secondary',
          Ramping: 'text-cyan-600 dark:text-cyan-400',
          Current: 'text-blue-600 dark:text-blue-400',
          Draining: 'text-yellow-600 dark:text-yellow-200',
          Drained: 'text-secondary',
          Inactive: 'text-secondary',
          Created: 'text-secondary',
        },
      },
    },
  );
</script>

<Tooltip text={tooltip[status]} topLeft width={250} usePortal>
  <p class={deploymentStatus({ status })}>
    {#if icon[status]}
      {@const StatusIcon = icon[status]}
      <StatusIcon />
    {/if}
    {label}
  </p>
</Tooltip>
