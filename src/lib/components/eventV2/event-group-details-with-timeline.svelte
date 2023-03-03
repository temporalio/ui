<script lang="ts">
  import EventDetailsRowExpanded from '$lib/components/event/event-details-row-expanded.svelte';

  import {
    formatAttributes,
    attributeGroups,
  } from '$lib/utilities/format-event-attributes';
  import EventDetailPills from '$lib/components/event/event-detail-pills.svelte';
  import EventGroupDetails from '$lib/components/event/event-group-details.svelte';
  import { isEventGroup } from '$lib/models/event-groups';
  import EventDetailRowItem from './event-detail-row-item.svelte';
  import Badge from '$lib/holocene/badge.svelte';

  export let event: WorkflowEvent;
  export let compact = true;

  $: attributes = formatAttributes(event, { compact });

  $: eventDetails = Object.entries(attributes);
  const allowedKeys = [
    'eventTime',
    'identity',
    'signalName',
    'markerName',
    // 'details',
    // 'input',
    'namespace',
    'startToFireTimeout',
  ];

  $: filteredDetails = eventDetails.filter(([key, value]) => {
    return allowedKeys.includes(key);
  });
</script>

<div class="flex w-full flex-col lg:flex-row">
  <div class="w-full flex gap-4">
    <div class="flex gap-4 w-48 truncate">
      <p>{event.id}</p>
      <p>{event.classification}</p>
    </div>
    <div class="flex gap-4">
      {#each filteredDetails as [key, value] (key)}
        <EventDetailRowItem {key} {value} {attributes} class="w-full" />
      {/each}
    </div>
  </div>
</div>
