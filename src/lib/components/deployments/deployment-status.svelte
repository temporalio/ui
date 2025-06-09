<script lang="ts">
  import { cva } from 'class-variance-authority';

  import type { IconName } from '$lib/holocene/icon';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { DeploymentStatus } from '$lib/types/deployments';

  export let status: DeploymentStatus;
  export let label: string;

  const icon: Record<DeploymentStatus, IconName> = {
    Current: 'heartbeat',
    Ramping: 'trending-up',
    Draining: 'trending-down',
    Drained: 'drained',
    Inactive: 'inactive',
  };

  const deploymentStatus = cva(
    ['flex items-center gap-1 px-1 transition-colors'],
    {
      variants: {
        status: {
          Ramping: 'text-cyan-600 dark:text-cyan-400',
          Current: 'text-blue-600 dark:text-blue-400',
          Draining: 'text-yellow-600 dark:text-yellow-200',
          Drained: 'text-secondary',
          Inactive: 'text-secondary',
        },
      },
    },
  );
</script>

<p class={deploymentStatus({ status })}>
  <Icon name={icon[status]} />{label}
</p>
