<script lang="ts">
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { WorkflowEvent } from '$lib/types/events';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import { isPendingActivity } from '$lib/utilities/is-pending-activity';

  import WorkflowPendingActivity from '../workflow/pending-activity/workflow-pending-activity.svelte';

  import EventCard from './event-card.svelte';
  import EventDetailsRowExpanded from './event-details-row-expanded.svelte';

  let {
    group = undefined,
    event = undefined,
  }: { group?: EventGroup; event?: WorkflowEvent } = $props();

  const pendingEvent = $derived(
    group?.pendingActivity || group?.pendingNexusOperation,
  );
  const showEventGroup = $derived(
    group && (group.eventList.length > 1 || pendingEvent),
  );
</script>

{#if showEventGroup}
  <div class="flex flex-col gap-1 overflow-hidden py-2">
    {#each group.eventList as groupEvent}
      <EventCard event={groupEvent}>
        {#snippet title()}
          <div class="flex items-center justify-between gap-4">
            <div class="flex gap-2">
              <p class="font-mono">{groupEvent.id}</p>
              <p class="font-medium">
                {spaceBetweenCapitalLetters(groupEvent.name)}
              </p>
            </div>
            <div class="text-sm">
              {formatDate(groupEvent.eventTime, $timeFormat, {
                relative: $relativeTime,
              })}
            </div>
          </div>
        {/snippet}
      </EventCard>
    {/each}
    {#if group?.pendingActivity}
      <WorkflowPendingActivity activity={group.pendingActivity} />
    {:else if group?.pendingNexusOperation}
      {@const details = Object.entries(group?.pendingNexusOperation)}
      <div class="w-full border-subtle [&:not(:last-child)]:border-r">
        <div class="pending flex w-full justify-between px-2 py-1 text-white">
          <div class="flex gap-2">
            Pending {isPendingActivity(group?.pendingNexusOperation)
              ? 'Activity'
              : 'Nexus Operation'}
          </div>
        </div>
        {#each details as [key, value] (key)}
          <EventDetailsRowExpanded
            {key}
            {value}
            attributes={group?.pendingNexusOperation}
          />
        {/each}
      </div>
    {/if}
  </div>
{:else if event}
  <EventCard {event} />
{/if}

<style lang="postcss">
  .pending {
    background: repeating-linear-gradient(
      to right,
      #444ce7 0,
      #444ce7 4px,
      #2f34a4 4px,
      #2f34a4 8px
    );
  }
</style>
