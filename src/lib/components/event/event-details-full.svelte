<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { resolveSystemNexusEvent } from '$lib/system-nexus-endpoints';
  import type { PendingActivity, WorkflowEvent } from '$lib/types/events';
  import type { WorkflowExecutionIdentity } from '$lib/types/workflows';
  import { isActivityTaskScheduledEvent } from '$lib/utilities/is-event-type';

  import PendingActivityCard from '../workflow/pending-activity/pending-activity-card.svelte';
  import PendingNexusOperationCard from '../workflow/pending-nexus-operation/pending-nexus-operation-card.svelte';

  import EventCard from './event-card.svelte';

  let {
    group = undefined,
    event = undefined,
    lazy = false,
    groupRow = false,
    executionIdentity,
    activityActions,
  }: {
    group?: EventGroup;
    event?: WorkflowEvent;
    lazy?: boolean;
    /** The row that opened this represents the whole group, not one event. */
    groupRow?: boolean;
    executionIdentity?: WorkflowExecutionIdentity;
    activityActions?: Snippet<[PendingActivity]>;
  } = $props();

  const pendingEvent = $derived(
    group?.pendingActivity || group?.pendingNexusOperation,
  );

  // An operation can ask that opening one of its events opens only that event.
  // That applies to a row for a single event; a row for the group itself was an
  // explicit request for the group, so it always opens every card.
  const expandsIndividually = $derived(
    !groupRow &&
      (resolveSystemNexusEvent(event, {
        initiatingEvent: group?.initialEvent,
      })?.expandsIndividually ??
        false),
  );

  const showEventGroup = $derived(
    group &&
      !expandsIndividually &&
      (group.eventList.length > 1 || pendingEvent),
  );
</script>

{#if showEventGroup}
  <div class="flex flex-col overflow-hidden">
    {#if group?.pendingActivity}
      <PendingActivityCard
        activity={group.pendingActivity}
        actions={activityActions}
        scheduledEvent={isActivityTaskScheduledEvent(group.initialEvent)
          ? group.initialEvent
          : undefined}
      />
    {:else if group?.pendingNexusOperation}
      <PendingNexusOperationCard operation={group.pendingNexusOperation} />
    {/if}
    {#each group?.eventList ?? [] as groupEvent (groupEvent.id)}
      <EventCard
        {executionIdentity}
        event={groupEvent}
        initiatingEvent={group?.initialEvent}
        {lazy}
      />
    {/each}
  </div>
{:else if event}
  <EventCard
    {event}
    {executionIdentity}
    initiatingEvent={group?.initialEvent}
    {lazy}
  />
{/if}
