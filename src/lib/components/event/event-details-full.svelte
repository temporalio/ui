<script lang="ts">
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { WorkflowEvent } from '$lib/types/events';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';

  import EventDetailsRowExpanded from './event-details-row-expanded.svelte';

  export let group: EventGroup | undefined = undefined;
  export let event: WorkflowEvent;

  const getAttributes = (event: WorkflowEvent) => formatAttributes(event);
</script>

{#if group && group.eventList.length > 1}
  <div class="w-full p-2">
    <div
      class="flex flex-col gap-0 overflow-hidden rounded-xl border-2 border-interactive xl:flex-row"
    >
      {#each group.eventList as groupEvent}
        {@const attributes = getAttributes(groupEvent)}
        {@const details = Object.entries(attributes)}
        <div class="w-full border-interactive [&:not(:last-child)]:border-r-2">
          <div
            class="flex w-full justify-between bg-interactive px-2 py-1 text-white"
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
          {#each details as [key, value] (key)}
            <EventDetailsRowExpanded {key} {value} {attributes} />
          {/each}
        </div>
      {/each}
    </div>
  </div>
{:else}
  {@const attributes = getAttributes(event)}
  {@const details = Object.entries(attributes)}
  <div class="w-full p-2">
    <div class="w-full overflow-hidden rounded-xl border-2 border-interactive">
      {#each details as [key, value] (key)}
        <EventDetailsRowExpanded {key} {value} {attributes} />
      {/each}
    </div>
  </div>
{/if}
