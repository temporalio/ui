<script lang="ts">
  import { cva } from 'class-variance-authority';

  import HeartBeat from '$lib/components/heart-beat-indicator.svelte';
  import type { ServerlessWorkerStatus } from '$lib/types/serverless-workers';

  interface Props {
    delay?: number;
    status?: ServerlessWorkerStatus;
    'test-id'?: string;
  }

  let { delay = 0, status = 'running', 'test-id': testId }: Props = $props();

  const label: Record<ServerlessWorkerStatus, string> = {
    running: 'Running',
    stopped: 'Stopped',
    draining: 'Draining',
  };

  const workerStatus = cva(
    [
      'flex items-center rounded-sm px-1 py-0.5 h-5 whitespace-nowrap text-black gap-1 font-medium',
    ],
    {
      variants: {
        status: {
          running: 'bg-green-200',
          stopped: 'bg-yellow-200',
          draining: 'bg-yellow-100',
        },
      },
    },
  );

  const isRunning = $derived(status === 'running');
</script>

<div
  class="relative flex items-center gap-0 text-center text-xs leading-4"
  data-testid={testId}
>
  <span class={workerStatus({ status })}>
    {label[status]}
    {#if isRunning}
      <HeartBeat {delay} color="rgb(187 247 208)" />
    {/if}
  </span>
</div>
