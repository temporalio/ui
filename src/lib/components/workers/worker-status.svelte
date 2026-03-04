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
    'Shutting Down': 'Shutting Down',
    Unspecified: translate('events.event-classification.unspecified'),
  };

  const workerStatus = cva(
    [
      'flex items-center rounded-sm px-1 py-0.5 h-5 whitespace-nowrap text-black gap-1 font-medium',
    ],
    {
      variants: {
        status: {
          Unspecified: 'bg-slate-100',
          Running: 'bg-blue-300',
          'Shutting Down': 'bg-yellow-200',
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
