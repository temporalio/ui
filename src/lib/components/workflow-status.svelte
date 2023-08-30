<script lang="ts">
  import { cva } from 'class-variance-authority';

  import { translate } from '$lib/i18n/translate';
  import type { ScheduleStatus } from '$lib/types/schedule';
  import type { WorkflowStatus } from '$lib/types/workflows';

  import HeartBeat from './heart-beat-indicator.svelte';

  type Status = WorkflowStatus | ScheduleStatus;

  export let delay = 0;
  export let status: Status = 'Running';

  const label: Record<Status, string> = {
    Running: translate('workflows', 'running'),
    TimedOut: translate('workflows', 'timed-out'),
    Completed: translate('workflows', 'completed'),
    Failed: translate('workflows', 'failed'),
    ContinuedAsNew: translate('workflows', 'continued-as-new'),
    Canceled: translate('workflows', 'canceled'),
    Terminated: translate('workflows', 'terminated'),
    Paused: translate('workflows', 'paused'),
  };

  const workflowStatus = cva(
    [
      'flex items-center rounded-sm px-1 py-0.5 font-secondary whitespace-nowrap',
    ],
    {
      variants: {
        status: {
          Running: 'bg-blue-100 text-blue-700',
          TimedOut: 'bg-orange-100 text-orange-700',
          Completed: 'bg-green-100 text-green-700',
          Failed: 'bg-red-100 text-red-700',
          ContinuedAsNew: 'bg-gray-200 text-gray-900',
          Canceled: 'bg-yellow-100 text-yellow-900',
          Terminated: 'bg-red-100 text-red-700',
          Paused: 'bg-yellow-100 text-yellow-700',
        },
      },
    },
  );
</script>

<div class="flex text-center text-sm font-medium leading-4">
  <span class={workflowStatus({ status })}>
    {label[status]}
    {#if status === 'Running'}
      <HeartBeat {delay} />
    {/if}
  </span>
</div>
