<script>import EventDetailsRowExpanded from './event-details-row-expanded.svelte';
import { formatAttributes, attributeGroups, } from '../../utilities/format-event-attributes';
import EventDetailPills from './event-detail-pills.svelte';
import EventGroupDetails from './event-group-details.svelte';
export let event;
export let compact = false;
export let eventGroup;
export let selectedId;
$: attributes = formatAttributes(event, { compact });
$: attributeGrouping = attributeGroups(event, attributes);
$: activePill = Object.keys(attributeGrouping).find((key) => attributeGrouping[key].length);
const handlePillChange = (event) => {
    activePill = event.detail.key;
};
const handleGroupClick = (id) => (selectedId = id);
</script>

{#if compact && eventGroup}
  <div class="flex w-full flex-col lg:flex-row">
    <EventGroupDetails
      {eventGroup}
      {selectedId}
      onGroupClick={handleGroupClick}
    />
    <div class="block w-full lg:w-2/3">
      <EventDetailPills
        {attributeGrouping}
        {activePill}
        on:pillChange={handlePillChange}
      />
      {#each Object.entries(attributes) as [key, value] (key)}
        {#if attributeGrouping[activePill]?.includes(key)}
          <EventDetailsRowExpanded {key} {value} class="w-full" />
        {/if}
      {/each}
    </div>
  </div>
{:else}
  <div class="w-full">
    <EventDetailPills
      {attributeGrouping}
      {activePill}
      on:pillChange={handlePillChange}
    />
    {#each Object.entries(attributes) as [key, value] (key)}
      {#if attributeGrouping[activePill]?.includes(key)}
        <EventDetailsRowExpanded {key} {value} class="w-full" />
      {/if}
    {/each}
  </div>
{/if}
