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
      'flex items-center gap-1 px-1 transition-colors rounded-sm border border-subtle',
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

<Tooltip text={tooltip[status]} topLeft width={250}>
  <p class={deploymentStatus({ status })}>
    {#if icon[status]}<Icon name={icon[status]!} />{/if}{label}
  </p>
</Tooltip>
