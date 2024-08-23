<script lang="ts">
  import { noop } from 'svelte/internal';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { PendingActivity } from '$lib/types/events';

  import EventDetailsFull from './event-details-full.svelte';

  export let event: PendingActivity;
  export let group: EventGroup | undefined = undefined;
  export let index: number;
  export let expandAll = false;
  export let typedError = false;
  export let active = false;
  export let onRowClick: () => void = noop;

  $: expanded = expandAll;

  const onLinkClick = () => {
    expanded = !expanded;
    onRowClick();
  };
</script>

<tr
  class="row dense"
  id={`${event.id}-${index}`}
  class:expanded={expanded && !expandAll}
  class:active
  class:typedError
  data-testid="event-summary-row"
  on:click|stopPropagation={onLinkClick}
>
  <td class="w-10" />
  <td
    class="w-full overflow-hidden text-right text-sm font-normal xl:text-left"
  >
    <div class="flex">
      <div class="flex w-full items-center gap-2">
        <Icon name="activity" />
        <p class="event-name truncate text-sm font-semibold md:text-base">
          Pending Activity
        </p>
        <Icon
          class="mr-1.5 inline {event.attempt > 1
            ? 'text-red-700'
            : 'text-green-700'}"
          name="retry"
        />
        {event.attempt} / {event.maximumAttempts || '∞'}
      </div>
    </div>
  </td>
  <td />
</tr>
{#if expanded}
  <tr class:typedError class="row expanded">
    <td class="expanded-cell w-full" colspan="3">
      <EventDetailsFull {group} />
    </td>
  </tr>
{/if}

<style lang="postcss">
  .row {
    @apply flex select-none items-center text-sm no-underline;
  }

  .expanded-cell {
    @apply text-sm no-underline;
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
</style>
