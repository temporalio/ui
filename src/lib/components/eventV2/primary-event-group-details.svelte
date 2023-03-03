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
  import isFirstDayOfMonth from 'date-fns/isFirstDayOfMonth/index';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { getPrimaryEventDetail } from './event-detail-keys';

  export let event: WorkflowEvent;
  export let hasGroupEvents = true;
  export let compact = true;

  $: attributes = formatAttributes(event, { compact });

  $: eventDetails = Object.entries(attributes);
  const allowedKeys = [
    'identity',
    // 'markerName',
    // 'details',
    // 'input',
    'namespace',
    'startToFireTimeout',
  ];

  $: filteredDetails = eventDetails.filter(([key, value]) => {
    return allowedKeys.includes(key);
  });
</script>

{#if !hasGroupEvents}
  <div class="flex gap-4 items-center">
    <Badge type="blue">{getPrimaryEventDetail(event).label}</Badge>
    {#each filteredDetails as [key, value] (key)}
      <EventDetailRowItem {key} {value} {attributes} />
    {/each}
  </div>
{:else}
  <div class="flex gap-4">
    <Badge type="blue">{getPrimaryEventDetail(event).label}</Badge>
  </div>
{/if}
