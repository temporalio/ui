<script lang="ts">
  import { page } from '$app/state';

  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import type { WorkflowEvent } from '$lib/types/events';
  import { formatAttributes } from '$lib/utilities/format-event-attributes';
  import { displayLinkType } from '$lib/utilities/get-single-attribute-for-event';

  import PendingActivityCard from '../workflow/pending-activity/pending-activity-card.svelte';
  import PendingNexusOperationCard from '../workflow/pending-nexus-operation/pending-nexus-operation-card.svelte';

  import EventCard from './event-card.svelte';
  import EventDetailsSection from './event-details-section.svelte';
  import EventPayloads from './event-payloads.svelte';

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

  const processedEvents = $derived.by(() => {
    if (!group || !showEventGroup) return [];
    return group.eventList.map((evt) => {
      const attrs = formatAttributes(evt);
      if (evt?.principal?.name) attrs.principalName = evt.principal.name;
      if (evt?.principal?.type) attrs.principalType = evt.principal.type;
      const fields = Object.entries(attrs);
      const payloadFields = fields.filter(
        ([_key, value]) =>
          typeof value === 'object' && Object.keys(value).length > 0,
      );
      const linkFields = fields.filter(
        ([key, _value]) => displayLinkType(key, attrs) !== 'none',
      );
      const hiddenDetailFields = (() => {
        if (evt.category === 'activity')
          return ['scheduledEventId', 'startedEventId', 'namespaceId'];
        if (evt.category === 'child-workflow')
          return ['initiatedEventId', 'startedEventId', 'namespaceId'];
        return ['namespaceId'];
      })();
      const detailFields = fields.filter(
        ([key, value]) =>
          typeof value !== 'object' &&
          displayLinkType(key, attrs) === 'none' &&
          !hiddenDetailFields.includes(key) &&
          (key !== 'namespace' ||
            (key === 'namespace' && page.params.namespace !== value)),
      );
      return {
        event: evt,
        attributes: attrs,
        payloadFields,
        detailFields,
        linkFields,
      };
    });
  });

  const payloadKeyOrder = [
    'result',
    'input',
    'lastFailure',
    'failure',
    'header',
    'searchAttributes',
    'memo',
  ];

  const allPayloadFields = $derived.by(() => {
    const all = processedEvents.flatMap((p) => p.payloadFields);
    return all.toSorted(([a], [b]) => {
      const aIndex = payloadKeyOrder.indexOf(a);
      const bIndex = payloadKeyOrder.indexOf(b);
      const aOrder = aIndex !== -1 ? aIndex : payloadKeyOrder.length - 1;
      const bOrder = bIndex !== -1 ? bIndex : payloadKeyOrder.length - 1;
      return aOrder - bOrder;
    });
  });

  const hasAnyPayloads = $derived(allPayloadFields.length > 0);
</script>

{#if showEventGroup}
  <div
    class="surface-primary flex flex-col overflow-hidden border-t border-subtle"
  >
    {#if group?.pendingActivity}
      <PendingActivityCard activity={group.pendingActivity} />
    {:else if group?.pendingNexusOperation}
      <PendingNexusOperationCard operation={group.pendingNexusOperation} />
    {/if}

    {#if hasAnyPayloads}
      <div class="flex flex-col border-b border-subtle lg:flex-row">
        <div class="flex w-full flex-col lg:w-1/2 xl:w-1/3">
          {#each processedEvents as processed, i (processed.event.id)}
            <div
              class="p-4 {i < processedEvents.length - 1
                ? 'border-b border-subtle'
                : ''}"
            >
              <div class="flex flex-col gap-1">
                <EventDetailsSection
                  event={processed.event}
                  {group}
                  attributes={processed.attributes}
                  detailFields={processed.detailFields}
                  linkFields={processed.linkFields}
                />
              </div>
            </div>
          {/each}
        </div>
        <div
          class="flex w-full flex-col gap-1 p-4 lg:w-1/2 lg:border-l lg:border-subtle xl:w-2/3"
        >
          <EventPayloads payloadFields={allPayloadFields} />
        </div>
      </div>
    {:else}
      {#each processedEvents as processed (processed.event.id)}
        <div class="border-b border-subtle p-4">
          <div class="flex flex-col gap-1">
            <EventDetailsSection
              event={processed.event}
              {group}
              attributes={processed.attributes}
              detailFields={processed.detailFields}
              linkFields={processed.linkFields}
            />
          </div>
        </div>
      {/each}
    {/if}
  </div>
{:else if event}
  <EventCard {event} />
{/if}
