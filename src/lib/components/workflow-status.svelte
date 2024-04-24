<script lang="ts">
  import { fade } from 'svelte/transition';

  import { cva } from 'class-variance-authority';

  import Spinner from '$lib/holocene/icon/svg/spinner.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventClassification } from '$lib/models/event-history/get-event-classification';
  import type { ScheduleStatus } from '$lib/types/schedule';
  import type { WorkflowStatus } from '$lib/types/workflows';

  import HeartBeat from './heart-beat-indicator.svelte';

  type Status = WorkflowStatus | ScheduleStatus | EventClassification;

  export let delay = 0;
  export let status: Status = 'Running';
  export let count: number | undefined = undefined;
  export let loading = false;
  export let newCount: number | undefined = undefined;
  export let big = false;

  const label: Record<Status, string> = {
    Running: translate('workflows.running'),
    TimedOut: translate('workflows.timed-out'),
    Completed: translate('workflows.completed'),
    Failed: translate('workflows.failed'),
    ContinuedAsNew: translate('workflows.continued-as-new'),
    Canceled: translate('workflows.canceled'),
    Terminated: translate('workflows.terminated'),
    Paused: translate('workflows.paused'),
    Scheduled: translate('events.event-classification.started'),
    Started: translate('events.event-classification.started'),
    Unspecified: translate('events.event-classification.unspecified'),
    Open: translate('events.event-classification.open'),
    New: translate('events.event-classification.new'),
    Initiated: translate('events.event-classification.initiated'),
    Fired: translate('events.event-classification.fired'),
    CancelRequested: translate('events.event-classification.cancelrequested'),
    Signaled: translate('events.event-classification.signaled'),
  };

  const workflowStatus = cva(
    ['flex  rounded-sm px-1 py-0.5 font-secondary whitespace-nowrap'],
    {
      variants: {
        status: {
          Running: 'bg-blue-100 text-blue-700',
          TimedOut: 'bg-orange-100 text-orange-700',
          Completed: 'bg-green-100 text-green-700',
          Failed: 'bg-red-100 text-red-700',
          ContinuedAsNew: 'bg-slate-200 text-primary',
          Canceled: 'bg-yellow-100 text-yellow-900',
          Terminated: 'bg-red-100 text-red-700',
          Paused: 'bg-yellow-100 text-yellow-700',
          Unspecified: 'bg-slate-200 text-primary',
          Scheduled: 'bg-blue-100 text-blue-700',
          Started: 'bg-blue-100 text-blue-700',
          Open: 'bg-green-100 text-green-700',
          New: 'bg-indigo-100 text-indigo-700',
          Initiated: 'bg-blue-100 text-blue-700',
          Fired: 'bg-blue-100 text-blue-700',
          CancelRequested: 'bg-yellow-100 text-yellow-900',
          Signaled: 'bg-purple-100 text-purple-700',
        },
      },
    },
  );
</script>

<div
  class="relative flex gap-0 text-center text-sm leading-4"
  data-testid={$$props['test-id']}
>
  <span
    class="flex gap-1 font-medium {workflowStatus({
      status,
    })}"
    class:rounded-r-none={newCount}
    class:big
  >
    {#if loading}
      <Spinner class="h-4 w-4 animate-spin" />
    {:else if count >= 0}
      {count.toLocaleString()}
    {/if}

    {label[status]}
    {#if status === 'Running'}
      <HeartBeat {delay} />
    {/if}
  </span>
  {#if newCount}
    <span
      class="font-base surface-primary rounded-r px-1 py-0.5 text-xs text-primary"
      in:fade
    >
      {#if newCount > 0}+{/if}{newCount}
    </span>
  {/if}
</div>

<style lang="postcss">
  .big {
    @apply flex justify-center px-4 text-lg;
  }
</style>
