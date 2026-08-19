<script lang="ts">
  import { cva } from 'class-variance-authority';

  import HeartBeat from '$lib/components/heart-beat-indicator.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { WorkerStatus } from '$lib/models/worker-status';

  interface Props {
    delay?: number;
    status?: WorkerStatus;
  }

  let { delay = 0, status = 'Running' }: Props = $props();

  const label: Record<WorkerStatus, string> = {
    Running: translate('workflows.running'),
    ShuttingDown: translate('workers.shutting-down'),
    Unspecified: translate('events.event-classification.unspecified'),
  };

  const workerStatus = cva(
    [
      'flex items-center rounded-sm px-1 py-0.5 h-5 whitespace-nowrap gap-1 font-medium',
    ],
    {
      variants: {
        status: {
          Unspecified: 'bg-io-surface-status-neutral text-io-content-primary',
          Running: 'bg-io-surface-status-blue text-io-content-information',
          ShuttingDown: 'bg-io-surface-status-amber text-io-content-warning',
        },
      },
    },
  );

  const isRunning = $derived(status === 'Running');
</script>

<div class="relative flex items-center gap-0 text-center text-xs leading-4">
  <span class={workerStatus({ status })}>
    {label[status]}
    {#if isRunning}
      <HeartBeat {delay} />
    {/if}
  </span>
</div>
