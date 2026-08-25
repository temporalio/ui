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
      'flex h-5 items-center gap-0.5 whitespace-nowrap rounded-sm border border-transparent px-1 py-0.5 font-medium',
    ],
    {
      variants: {
        status: {
          Running: 'border-information bg-surface-information text-information',
          TimedOut: 'border-error bg-surface-error text-error',
          Completed: 'border-success bg-surface-success text-success',
          Failed: 'border-danger bg-surface-danger text-danger',
          ContinuedAsNew: 'border-success bg-surface-success text-success',
          Canceled: 'border-tertiary bg-surface-tertiary text-secondary',
          Terminated: 'border-warning bg-surface-warning text-warning',
          Paused: 'border-information bg-surface-information text-information',
          Unspecified: 'border-tertiary bg-surface-primary text-secondary',
          Scheduled:
            'border-information bg-surface-information text-information',
          Started: 'border-information bg-surface-information text-information',
          Open: 'border-success bg-surface-success text-success',
          New: 'border-information bg-surface-information text-information',
          Initiated:
            'border-information bg-surface-information text-information',
          Fired: 'bg-alpha-pink-30 text-primary',
          CancelRequested: 'border-warning bg-surface-warning text-warning',
          Signaled: 'bg-alpha-pink-30 text-primary',
          Pending: 'bg-alpha-purple-30 text-primary',
          Retrying: 'border-danger bg-surface-danger text-danger',
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
        (newCount || delayed || taskFailure) && 'rounded-r-none border-r-0',
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
          'rounded-l-none border-l-0',
          (newCount || taskFailure) && 'rounded-r-none border-r-0',
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
          'border-danger bg-surface-danger text-danger',
          'rounded-l-none border-l-0',
          newCount && 'rounded-r-none border-r-0',
          big && 'h-8 px-2',
        )}
      >
        <IconExclamationOctagon class={merge(!big && 'px-0.5')} />
      </span>
    {/if}

    {#if newCount}
      <span
        class={merge(
          'font-base h-5 rounded-r-sm border border-l-0 border-tertiary bg-surface-primary px-1 py-0.5 text-primary',
          big && 'h-8 px-2',
        )}
        in:fade
      >
        {#if newCount > 0}+{/if}{newCount}
      </span>
    {/if}
  </div>
</Tooltip>
