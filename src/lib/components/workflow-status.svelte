<script lang="ts">
  import { fade } from 'svelte/transition';

  import { cva } from 'class-variance-authority';
  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Spinner from '$lib/holocene/icon/svg/spinner.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventClassification } from '$lib/models/event-history/get-event-classification';
  import type { ScheduleStatus } from '$lib/types/schedule';
  import type { WorkflowStatus } from '$lib/types/workflows';

  import HeartBeat from './heart-beat-indicator.svelte';

  type Status =
    | WorkflowStatus
    | ScheduleStatus
    | EventClassification
    | 'Pending'
    | 'Retrying';

  export let delay = 0;
  export let status: Status = 'Running';
  export let count: number | undefined = undefined;
  export let loading = false;
  export let newCount: number | undefined = undefined;
  export let big = false;
  export let delayed = false;
  export let taskFailure = false;

  const label: Record<Status, string> = {
    Running: translate('workflows.running'),
    TimedOut: translate('workflows.timed-out'),
    Completed: translate('workflows.completed'),
    Failed: translate('workflows.failed'),
    ContinuedAsNew: translate('workflows.continued-as-new'),
    Canceled: translate('workflows.canceled'),
    Terminated: translate('workflows.terminated'),
    Paused: translate('workflows.paused'),
    Scheduled: translate('events.event-classification.scheduled'),
    Started: translate('events.event-classification.started'),
    Unspecified: translate('events.event-classification.unspecified'),
    Open: translate('events.event-classification.open'),
    New: translate('events.event-classification.new'),
    Initiated: translate('events.event-classification.initiated'),
    Fired: translate('events.event-classification.fired'),
    CancelRequested: translate('events.event-classification.cancelrequested'),
    Signaled: translate('events.event-classification.signaled'),
    Pending: translate('events.event-classification.pending'),
    Retrying: translate('events.event-classification.retrying'),
  };

  const workflowStatus = cva(
    [
      'flex items-center rounded-sm px-1 py-0.5 h-5 whitespace-nowrap text-black gap-1 font-medium',
    ],
    {
      variants: {
        status: {
          Running: 'bg-blue-300',
          TimedOut: 'bg-orange-200',
          Completed: 'bg-green-200',
          Failed: 'bg-red-200',
          ContinuedAsNew: 'bg-purple-200',
          Canceled: 'bg-slate-100',
          Terminated: 'bg-yellow-200',
          Paused: 'bg-yellow-200',
          Unspecified: 'bg-slate-100',
          Scheduled: 'bg-blue-300',
          Started: 'bg-blue-300',
          Open: 'bg-green-200',
          New: 'bg-blue-300',
          Initiated: 'bg-blue-300',
          Fired: 'bg-pink-200',
          CancelRequested: 'bg-yellow-200',
          Signaled: 'bg-pink-200',
          Pending: 'bg-purple-200',
          Retrying: 'bg-red-200',
        },
      },
    },
  );

  $: tooltipText = delayed
    ? translate('workflows.delayed')
    : taskFailure
      ? translate('workflows.task-failure')
      : '';
</script>

<Tooltip
  topLeft
  text={tooltipText}
  hide={!delayed && !taskFailure}
  class="block"
>
  <div
    class={merge(
      'relative flex items-center gap-0 text-center text-xs leading-4',
      big && 'text-lg',
    )}
    data-testid={$$props['test-id']}
  >
    <span
      class={merge(
        workflowStatus({
          status,
        }),
        (newCount || delayed || taskFailure) && 'rounded-r-none',
        big && 'h-8 px-4',
      )}
    >
      {#if loading}
        <Spinner class="h-4 w-4 animate-spin" />
      {:else if count >= 0}
        {count.toLocaleString()}
      {/if}

      {label[status]}
      {#if status === 'Running' && !delayed && !taskFailure}
        <HeartBeat {delay} />
      {/if}
    </span>
    {#if delayed}
      <span
        class={merge(
          workflowStatus({
            status: 'Paused',
          }),
          'rounded-l-none',
          (newCount || taskFailure) && 'rounded-r-none',
          big && 'h-8 px-2',
        )}
      >
        <Icon name="clock" class={merge(!big && 'px-0.5')} />
      </span>
    {/if}
    {#if taskFailure}
      <span
        class={merge(
          workflowStatus({
            status: 'Failed',
          }),
          'rounded-l-none',
          newCount && 'rounded-r-none',
          big && 'h-8 px-2',
        )}
      >
        <Icon name="error" class={merge(!big && 'px-0.5')} />
      </span>
    {/if}

    {#if newCount}
      <span
        class={merge(
          'font-base surface-primary rounded-r-sm px-1 py-0.5',
          big && 'px-2',
        )}
        in:fade
      >
        {#if newCount > 0}+{/if}{newCount}
      </span>
    {/if}
  </div>
</Tooltip>
