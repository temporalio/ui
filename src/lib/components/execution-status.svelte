<script lang="ts">
  import { fade } from 'svelte/transition';

  import { cva } from 'class-variance-authority';
  import { twMerge as merge } from 'tailwind-merge';

  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconClock, IconExclamationOctagon, IconSpinner } from '$lib/io/icon';
  import { getStatusLabel, type Status } from '$lib/utilities/get-status-label';

  import HeartBeat from './heart-beat-indicator.svelte';

  interface Props {
    delay?: number;
    status?: Status;
    count?: number | undefined;
    loading?: boolean;
    newCount?: number | undefined;
    big?: boolean;
    delayed?: boolean;
    taskFailure?: boolean;
    announce?: boolean;
    'test-id'?: string;
  }

  let {
    delay = 0,
    status = 'Running',
    count = undefined,
    loading = false,
    newCount = undefined,
    big = false,
    delayed = false,
    taskFailure = false,
    announce = false,
    'test-id': testId,
  }: Props = $props();

  const workflowStatus = cva(
    [
      'flex items-center rounded-sm px-1 py-0.5 h-5 whitespace-nowrap text-black gap-0.5 font-medium',
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

  const tooltipText = $derived(
    delayed
      ? translate('workflows.delayed')
      : taskFailure
        ? translate('workflows.task-failure')
        : '',
  );
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
    data-testid={testId || 'execution-status'}
  >
    <span
      role={announce ? 'status' : undefined}
      aria-atomic={announce ? 'true' : undefined}
      class={merge(
        workflowStatus({
          status,
        }),
        (newCount || delayed || taskFailure) && 'rounded-r-none',
        big && 'h-8 px-4',
      )}
    >
      {#if loading}
        <IconSpinner class="animate-spin" />
      {:else if count !== undefined && count >= 0}
        {count.toLocaleString()}
      {/if}

      {getStatusLabel(status)}
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
        <IconClock class={merge(!big && 'px-0.5')} />
      </span>
    {/if}
    {#if taskFailure}
      <span
        class={merge(
          workflowStatus(),
          'bg-red-200 text-red-900 dark:bg-red-700 dark:text-white',
          'rounded-l-none',
          newCount && 'rounded-r-none',
          big && 'h-8 px-2',
        )}
      >
        <IconExclamationOctagon class={merge(!big && 'px-0.5')} />
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
