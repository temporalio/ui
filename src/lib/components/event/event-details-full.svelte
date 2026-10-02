<script lang="ts">
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { resolveSystemNexusEvent } from '$lib/system-nexus-endpoints';
  import type { WorkflowEvent } from '$lib/types/events';

  import PendingActivityCard from '../workflow/pending-activity/pending-activity-card.svelte';
  import PendingNexusOperationCard from '../workflow/pending-nexus-operation/pending-nexus-operation-card.svelte';

  import EventCard from './event-card.svelte';

  let {
    group = undefined,
    event = undefined,
    lazy = false,
    groupRow = false,
    compact = false,
    historyOwner = undefined,
    hiddenFields = [],
  }: {
    group?: EventGroup;
    event?: WorkflowEvent;
    lazy?: boolean;
    /** The row that opened this represents the whole group, not one event. */
    groupRow?: boolean;
    /** Lays the cards out for a narrow container, such as a side panel. */
    compact?: boolean;
    /** The workflow whose history the events belong to, if not the page's. */
    historyOwner?: { namespace: string; workflowId: string; runId: string };
    /** Fields the surrounding view already shows; compact cards leave them out. */
    hiddenFields?: readonly string[];
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

  // The dot sits on the middle of a step's title line: the card's 16px top
  // padding plus half of the title's 20px line.
  const STEP_DOT_CENTER_PX = 26;

  const stepColor = (classification: WorkflowEvent['classification']) => {
    switch (classification) {
      case 'Completed':
        return 'var(--color-content-static-success)';
      case 'Failed':
      case 'TimedOut':
      case 'Terminated':
        return 'var(--color-content-static-danger)';
      case 'Canceled':
      case 'CancelRequested':
        return 'var(--color-content-static-warning)';
      default:
        return 'var(--color-content-tertiary)';
    }
  };

  const showEventGroup = $derived(
    group &&
      !expandsIndividually &&
      (group.eventList.length > 1 || pendingEvent),
  );
</script>

{#if showEventGroup}
  <div class="flex flex-col overflow-hidden">
    {#if group?.pendingActivity}
      <PendingActivityCard activity={group.pendingActivity} />
    {:else if group?.pendingNexusOperation}
      <PendingNexusOperationCard operation={group.pendingNexusOperation} />
    {/if}
    {#if compact}
      <!-- A group's events read as steps on a rail, each dot coloured by how
           that step ended, and each step timed from the one before it. -->
      <ol class="flex flex-col">
        {#each group?.eventList ?? [] as groupEvent, index (groupEvent.id)}
          {@const last = index === (group?.eventList.length ?? 0) - 1}
          <li class="relative pl-7">
            <span
              class="absolute left-[13px] w-px bg-border-primary"
              style:top={index === 0 ? `${STEP_DOT_CENTER_PX}px` : '0'}
              style:bottom={last ? `calc(100% - ${STEP_DOT_CENTER_PX}px)` : '0'}
              aria-hidden="true"
            ></span>
            <span
              class="absolute left-[9px] size-[9px] rounded-full"
              style:top="{STEP_DOT_CENTER_PX - 4.5}px"
              style:box-shadow="0 0 0 2px var(--color-surface-primary)"
              style:background={stepColor(groupEvent.classification)}
              aria-hidden="true"
            ></span>
            <EventCard
              {historyOwner}
              {hiddenFields}
              event={groupEvent}
              initiatingEvent={group?.initialEvent}
              {lazy}
              compact
              previousEventTime={index > 0
                ? group?.eventList[index - 1]?.eventTime
                : undefined}
            />
          </li>
        {/each}
      </ol>
    {:else}
      {#each group?.eventList ?? [] as groupEvent (groupEvent.id)}
        <EventCard
          {historyOwner}
          {hiddenFields}
          event={groupEvent}
          initiatingEvent={group?.initialEvent}
          {lazy}
          {compact}
        />
      {/each}
    {/if}
  </div>
{:else if event}
  <EventCard
    {historyOwner}
    {hiddenFields}
    {event}
    initiatingEvent={group?.initialEvent}
    {lazy}
    {compact}
  />
{/if}
