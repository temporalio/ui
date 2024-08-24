<script lang="ts">
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { relativeTime, timeFormat } from '$lib/stores/time-format';
  import type { WorkflowEvent } from '$lib/types/events';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';
  import { formatDate } from '$lib/utilities/format-date';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import { isChildWorkflowExecutionStartedEvent } from '$lib/utilities/is-event-type';
  import { isPendingActivity } from '$lib/utilities/is-pending-activity';

  import GraphWidget from '../lines-and-dots/svg/graph-widget.svelte';

  import EventDetailsRowExpanded from './event-details-row-expanded.svelte';

  export let group: EventGroup | undefined = undefined;
  export let event: WorkflowEvent | undefined = undefined;
  export let compact = false;

  $: pendingEvent = group?.pendingActivity || group?.pendingNexusOperation;
  $: showEventGroup = group && (group.eventList.length > 1 || pendingEvent);
  $: childWorkflowEvent =
    compact && group?.eventList.find(isChildWorkflowExecutionStartedEvent);
</script>

{#if showEventGroup}
  <div class="w-full p-2">
    <div
      class="flex flex-col gap-0 overflow-hidden rounded-xl border-2 border-subtle xl:flex-row"
      class:rounded-b-none={!!childWorkflowEvent}
    >
      {#each group.eventList as groupEvent}
        {@const attributes = formatAttributes(groupEvent)}
        {@const details = Object.entries(attributes)}
        <div class="w-full border-subtle [&:not(:last-child)]:border-r-2">
          <div class="flex w-full justify-between bg-subtle px-2 py-1">
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
      {#if pendingEvent}
        {@const details = Object.entries(pendingEvent)}
        <div class="w-full border-interactive [&:not(:last-child)]:border-r-2">
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
    {#if childWorkflowEvent}
      <GraphWidget
        namespace={childWorkflowEvent.attributes.namespace}
        workflowId={childWorkflowEvent.attributes.workflowExecution.workflowId}
        runId={childWorkflowEvent.attributes.workflowExecution.runId}
        height={240}
        class="overflow-x-hidden"
      />
    {/if}
  </div>
{:else if event}
  {@const attributes = formatAttributes(event)}
  {@const details = Object.entries(attributes)}
  <div class="w-full p-2">
    <div class="w-full overflow-hidden rounded-xl border-2 border-interactive">
      {#each details as [key, value] (key)}
        <EventDetailsRowExpanded {key} {value} {attributes} />
      {/each}
    </div>
  </div>
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
