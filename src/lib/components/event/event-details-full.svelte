<script lang="ts">
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { WorkflowEvent } from '$lib/types/events';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import { isPendingActivity } from '$lib/utilities/is-pending-activity';

  import EventDetailsRowExpanded from './event-details-row-expanded.svelte';
  import EventLinksExpanded from './event-links-expanded.svelte';
  import EventMetadataExpanded from './event-metadata-expanded.svelte';

  export let group: EventGroup | undefined = undefined;
  export let event: WorkflowEvent | undefined = undefined;

  $: pendingEvent = group?.pendingActivity || group?.pendingNexusOperation;
  $: showEventGroup = group && (group.eventList.length > 1 || pendingEvent);
</script>

{#if showEventGroup}
  <div class="w-full">
    <div
      class="border-subtle flex flex-col gap-0 overflow-hidden border xl:flex-row"
    >
      {#each group.eventList as groupEvent}
        {@const attributes = formatAttributes(groupEvent)}
        {@const details = Object.entries(attributes)}
        <div
          class="border-subtle w-full not-last:border-r"
          class:three-events={group.eventList.length === 3 ||
            (group.eventList.length === 2 && pendingEvent)}
          class:two-events={group.eventList.length === 2 ||
            (group.eventList.length === 1 && pendingEvent)}
        >
          <div
            class="bg-subtle flex w-full flex-wrap justify-between px-2 py-1"
          >
            <div class="flex gap-2">
              {groupEvent.id}
              {spaceBetweenCapitalLetters(groupEvent.name)}
            </div>
            <div>
              {formatDate(groupEvent.eventTime, $timeFormat, {
                relative: $relativeTime,
              })}
            </div>
          </div>
          {#if groupEvent?.userMetadata?.summary}
            <EventMetadataExpanded value={groupEvent.userMetadata.summary} />
          {/if}
          <EventLinksExpanded links={groupEvent?.links} />
          {#each details as [key, value] (key)}
            <EventDetailsRowExpanded {key} {value} {attributes} />
          {/each}
        </div>
      {/each}
      {#if pendingEvent}
        {@const details = Object.entries(pendingEvent)}
        <div
          class="border-subtle w-full not-last:border-r"
          class:three-events={group.eventList.length === 2}
          class:two-events={group.eventList.length === 1}
        >
          <div class="pending flex w-full justify-between px-2 py-1 text-white">
            <div class="flex gap-2">
              Pending {isPendingActivity(pendingEvent)
                ? 'Activity'
                : 'Nexus Operation'}
            </div>
          </div>
          {#each details as [key, value] (key)}
            <EventDetailsRowExpanded {key} {value} attributes={pendingEvent} />
          {/each}
        </div>
      {/if}
    </div>
  </div>
{:else if event}
  {@const attributes = formatAttributes(event)}
  {@const details = Object.entries(attributes)}
  <div class="w-full">
    <div class="border-subtle w-full overflow-hidden border">
      <EventLinksExpanded links={event?.links} />
      {#each details as [key, value] (key)}
        <EventDetailsRowExpanded {key} {value} {attributes} />
      {/each}
    </div>
  </div>
{/if}

<style lang="postcss">
  @reference "tailwindcss";

  .three-events {
    @apply xl:w-1/3;
  }

  .two-events {
    @apply xl:w-1/2;
  }

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
