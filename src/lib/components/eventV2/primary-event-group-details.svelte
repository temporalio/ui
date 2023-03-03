<script lang="ts">
  import {
    formatAttributes,
    attributeGroups,
  } from '$lib/utilities/format-event-attributes';

  import EventDetailRowItem from './event-detail-row-item.svelte';
  import Badge from '$lib/holocene/badge.svelte';
  import { getPrimaryEventDetail } from './event-detail-keys';

  export let event: WorkflowEvent;
  export let hasGroupEvents = true;
  export let compact = true;

  $: attributes = formatAttributes(event, { compact });
  $: attributeGrouping = attributeGroups(event, attributes);

  $: eventDetails = Object.entries(attributes);
  const denyKeys = [
    'eventTime',
    'binaryChecksum',
    'scheduledEventId',
    'startedEventId',
  ];

  $: filteredDetails = eventDetails.filter(([key, value]) => {
    return !denyKeys.includes(key);
  });
</script>

<div class="flex flex-wrap gap-4 items-center">
  {#each filteredDetails.slice(0, 3) as [key, value] (key)}
    <EventDetailRowItem {key} {value} {attributes} />
  {/each}
</div>
