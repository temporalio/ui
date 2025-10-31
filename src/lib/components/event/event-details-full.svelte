<script lang="ts">
  import { slide } from 'svelte/transition';

  import CodeBlock from '$lib/holocene/code-block.svelte';
  import { translate } from '$lib/i18n/translate';
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvent } from '$lib/types/events';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';

  import PendingActivityCard from '../workflow/pending-activity/pending-activity-card.svelte';
  import PendingNexusOperationCard from '../workflow/pending-nexus-operation/pending-nexus-operation-card.svelte';

  import EventCard from './event-card.svelte';
  import PayloadDecoder from './payload-decoder.svelte';

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

  const durationBetweenEvents = (
    eventA: WorkflowEvent,
    eventB: WorkflowEvent,
  ) =>
    formatDistanceAbbreviated({
      start: eventA?.eventTime,
      end: eventB?.eventTime,
      includeMilliseconds: true,
    });
</script>

<div class="bg-purple-600 pt-4 text-white" in:slide={{ duration: 150 }}>
  {#if showEventGroup}
    <div class="flex flex-col gap-3 overflow-hidden px-2">
      <div class="flex flex-col gap-2 lg:flex-row">
        <div class="flex w-full flex-col gap-1 lg:w-1/2">
          <h4>Input</h4>
          <PayloadDecoder value={group?.input} key="payloads">
            {#snippet children(decodedValue)}
              <CodeBlock
                content={decodedValue}
                maxHeight={384}
                copyIconTitle={translate('common.copy-icon-title')}
                copySuccessIconTitle={translate(
                  'common.copy-success-icon-title',
                )}
              />
            {/snippet}
          </PayloadDecoder>
        </div>
        <div class="flex w-full flex-col gap-1 lg:w-1/2">
          <h4>Result</h4>
          <PayloadDecoder value={group?.result} key="payloads">
            {#snippet children(decodedValue)}
              <CodeBlock
                content={decodedValue || 'Results will appear upon completion'}
                maxHeight={384}
                copyIconTitle={translate('common.copy-icon-title')}
                copySuccessIconTitle={translate(
                  'common.copy-success-icon-title',
                )}
              />
            {/snippet}
          </PayloadDecoder>
        </div>
      </div>
      <div class="flex flex-row justify-between gap-1">
        {#each group.eventList as _event, index}
          <div class="h-4 w-4 rounded-full bg-white"></div>
          {#if index !== group.eventList.length - 1}
            <p class="">
              {durationBetweenEvents(
                group?.eventList[index],
                group?.eventList[index + 1],
              )}
            </p>
          {/if}
        {/each}
      </div>

      <div class="flex flex-col gap-1 xl:flex-row">
        {#each group.eventList as groupEvent}
          <EventCard event={groupEvent} />
        {/each}
        {#if group?.pendingActivity}
          <PendingActivityCard activity={group.pendingActivity} />
        {:else if group?.pendingNexusOperation}
          <PendingNexusOperationCard operation={group.pendingNexusOperation} />
        {/if}
      </div>
    </div>
  {:else if event}
    <EventCard {event} />
  {/if}
</div>
