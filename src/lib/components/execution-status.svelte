<script lang="ts">
  import { cva } from 'class-variance-authority';
  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import Spinner from '$lib/holocene/icon/svg/spinner.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
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
      'flex h-5 items-center gap-1 whitespace-nowrap rounded-control border border-l-2 px-1.5 py-0.5 font-medium tabular-nums transition-colors duration-fast ease-standard',
    ],
    {
      variants: {
        status: {
          Running: 'border-information bg-information text-information',
          TimedOut: 'border-warning bg-warning text-warning',
          Completed: 'border-success bg-success text-success',
          Failed: 'border-danger bg-danger text-danger',
          ContinuedAsNew: 'border-information bg-information text-information',
          Canceled: 'border-subtle bg-subtle text-secondary',
          Terminated: 'border-danger bg-danger text-danger',
          Paused: 'border-warning bg-warning text-warning',
          Unspecified: 'border-subtle bg-subtle text-secondary',
          Scheduled: 'border-information bg-information text-information',
          Started: 'border-information bg-information text-information',
          Open: 'border-success bg-success text-success',
          New: 'border-information bg-information text-information',
          Initiated: 'border-information bg-information text-information',
          Fired: 'border-warning bg-warning text-warning',
          CancelRequested: 'border-warning bg-warning text-warning',
          Signaled: 'border-information bg-information text-information',
          Pending: 'border-information bg-information text-information',
          Retrying: 'border-danger bg-danger text-danger',
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
        big && 'h-control-sm px-3 text-sm',
      )}
    >
      {#if loading}
        <Spinner class="h-4 w-4 animate-spin" />
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
          '-ml-px rounded-l-none',
          (newCount || taskFailure) && 'rounded-r-none',
          big && 'h-control-sm px-2',
        )}
      >
        <Icon name="clock" class={merge(!big && 'px-0.5')} />
      </span>
    {/if}
    {#if taskFailure}
      <span
        class={merge(
          workflowStatus({ status: 'Failed' }),
          '-ml-px rounded-l-none',
          newCount && 'rounded-r-none',
          big && 'h-control-sm px-2',
        )}
      >
        <Icon name="exclamation-octagon" class={merge(!big && 'px-0.5')} />
      </span>
    {/if}

    {#if newCount}
      <span
        class={merge(
          'new-count surface-primary flex h-5 items-center rounded-r-control border border-l-0 border-subtle px-1.5 py-0.5 font-mono text-[11px] font-medium tabular-nums text-secondary',
          big && 'h-control-sm px-2 text-xs',
        )}
      >
        {#if newCount > 0}+{/if}{newCount}
      </span>
    {/if}
  </div>
</Tooltip>

<style lang="postcss">
  .new-count {
    animation: status-count-enter var(--duration-fast, 140ms)
      var(--ease-standard, ease-out);
  }

  @keyframes status-count-enter {
    from {
      opacity: 0;
      transform: translateX(-2px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .new-count {
      animation: none;
    }
  }
</style>
