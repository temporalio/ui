<svelte:options immutable />

<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';

  import { timeFormat } from '$lib/stores/time-format';
  import { workflowRun } from '$lib/stores/workflow-run';

  import { formatDate } from '$lib/utilities/format-date';
  import { noop } from 'svelte/internal';
  import EventCard from './event-card.svelte';
  import PendingActivityDetails from './pending-activity-details.svelte';

  export let event: PendingActivity;
  export let expandAll = false;
  export let active = false;
  export let onRowClick: () => void = noop;

  $: expanded = expandAll || active;

  const onLinkClick = () => {
    expanded = !expanded;
    onRowClick();
  };

  $: ({ workflow } = $workflowRun);

  $: canceled = ['Terminated', 'TimedOut', 'Canceled'].includes(
    workflow?.status,
  );
  $: failed = event.attempt > 1;
</script>

<div class="mb-2 flex w-full grow gap-2">
  <EventCard {expanded} pending>
    <div
      class="row"
      id={event.activityId}
      class:expanded={expanded && !expandAll}
      aria-expanded={expanded || expandAll}
      class:active
      data-testid="event-summary-row"
      on:click|stopPropagation={onLinkClick}
      on:keydown={onLinkClick}
    >
      <div class="primary flex w-full cursor-pointer justify-between">
        <div class="flex items-center gap-4">
          <div
            class="rounded-xl border-3 border-gray-900 bg-lightBlue py-1 px-2"
          >
            In progress
          </div>
          <div class="flex items-center">
            <p class="event-name truncate text-sm font-semibold md:text-base">
              {event.activityType}
            </p>
          </div>
        </div>
        <div class="flex gap-2">
          <Badge type={failed ? 'error' : 'default'}>
            {#if failed}
              <Icon name="retry" />
            {/if}
            {event.attempt}
          </Badge>
          {#if canceled}
            <Tooltip bottom text="Pending activities have been canceled.">
              <Badge type="warning" class="py-0"><Icon name="canceled" /></Badge
              >
            </Tooltip>
          {/if}
          <Icon name={expanded ? 'chevron-up' : 'chevron-down'} class="w-4" />
        </div>
      </div>
      <p
        class="break-word leading-0 truncate text-left md:whitespace-normal md:text-[12px]"
      >
        {formatDate(event.lastHeartbeatTime, 'relative')}
      </p>
    </div>
    {#if expanded}
      <div class="p-2">
        <PendingActivityDetails {event} />
      </div>
    {/if}
  </EventCard>
</div>

<style lang="postcss">
  .row {
    @apply w-full flex-wrap items-center rounded-xl border-gray-900 pl-8 pr-2 text-sm no-underline xl:py-3 xl:text-base;
  }

  .secondary {
    @apply mt-2 flex flex-col;
  }

  .expanded-cell {
    @apply table-cell w-full flex-wrap text-sm no-underline xl:text-base;
  }

  .typedError .expanded-cell {
    @apply border-b-0;
  }

  .row.typedError {
    @apply rounded-lg;

    &.expanded {
      @apply rounded-b-none;
    }
  }

  .active {
    @apply z-50 cursor-pointer bg-gradient-to-br from-blue-100 to-purple-100 bg-fixed;
  }
</style>
