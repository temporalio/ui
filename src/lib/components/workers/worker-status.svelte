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
      'flex h-5 items-center gap-1 whitespace-nowrap rounded-control border border-l-2 px-1.5 py-0.5 font-medium transition-colors duration-fast ease-standard',
    ],
    {
      variants: {
        status: {
          Unspecified: 'border-subtle bg-subtle text-secondary',
          Running: 'border-information bg-information text-information',
          ShuttingDown: 'border-warning bg-warning text-warning',
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
