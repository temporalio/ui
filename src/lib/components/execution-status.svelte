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
      'flex items-center rounded-sm px-1 py-0.5 h-5 whitespace-nowrap gap-0.5 font-medium',
    ],
    {
      variants: {
        status: {
          Running: 'bg-io-surface-information text-io-content-information',
          TimedOut: 'bg-io-surface-error text-io-content-error',
          Completed: 'bg-io-surface-success text-io-content-success',
          Failed: 'bg-io-surface-danger text-io-content-danger',
          ContinuedAsNew: 'bg-io-alpha-purple-30 text-io-content-primary',
          Canceled: 'bg-io-surface-primary text-io-content-secondary',
          Terminated: 'bg-io-surface-warning text-io-content-warning',
          Paused: 'bg-io-surface-warning text-io-content-warning',
          Unspecified: 'bg-io-surface-primary text-io-content-secondary',
          Scheduled: 'bg-io-surface-information text-io-content-information',
          Started: 'bg-io-surface-information text-io-content-information',
          Open: 'bg-io-surface-success text-io-content-success',
          New: 'bg-io-surface-information text-io-content-information',
          Initiated: 'bg-io-surface-information text-io-content-information',
          Fired: 'bg-io-alpha-pink-30 text-io-content-primary',
          CancelRequested: 'bg-io-surface-warning text-io-content-warning',
          Signaled: 'bg-io-alpha-pink-30 text-io-content-primary',
          Pending: 'bg-io-alpha-purple-30 text-io-content-primary',
          Retrying: 'bg-io-surface-danger text-io-content-danger',
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
          'bg-io-surface-danger text-io-content-danger',
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
          'font-base rounded-r-sm bg-io-surface-primary px-1 py-0.5 text-io-content-primary',
          big && 'px-2',
        )}
        in:fade
      >
        {#if newCount > 0}+{/if}{newCount}
      </span>
    {/if}
  </div>
</Tooltip>
