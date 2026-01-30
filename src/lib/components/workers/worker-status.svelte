<script lang="ts">
  import { cva } from 'class-variance-authority';

  import HeartBeat from '$lib/components/heart-beat-indicator.svelte';
  import type { ReadableWorkerStatus } from '$lib/utilities/screaming-enums';

  interface Props {
    delay?: number;
    status?: ReadableWorkerStatus;
    'test-id'?: string;
  }

  let { delay = 0, status = 'Running', 'test-id': testId }: Props = $props();

  const label: Record<ReadableWorkerStatus, string> = {
    Unspecified: 'Unspecified',
    Running: 'Running',
    'Shutting Down': 'Shutting Down',
    Shutdown: 'Shutdown',
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
          Shutdown: 'bg-red-200',
        },
      },
    },
  );

  const isRunning = $derived(status === 'Running');
</script>

<div
  class="relative flex items-center gap-0 text-center text-xs leading-4"
  data-testid={testId}
>
  <span class={workerStatus({ status })}>
    {label[status]}
    {#if isRunning}
      <HeartBeat {delay} />
    {/if}
  </span>
</div>
