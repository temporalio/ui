<script lang="ts">
  import type { EventGroup } from '$lib/models/event-groups/event-groups';
  import { capitalize } from '$lib/utilities/format-camel-case';

  export let group: EventGroup;

  console.log('Group: ', group);
</script>

<div class="h-[300px] text-white w-[1200px]">
  <div class="flex h-full">
    <div class="w-1/2 bg-blueGray-800 p-4 h-full">
      <div class="flex items-center gap-1">
        <span class="time text-[12px]">{group.lastEvent.id}</span>
        <h3 class="text-sm">{capitalize(group.lastEvent.category)}</h3>
        {group.lastEvent.classification}
      </div>
      <div class="grid grid-cols-3">
        {#each group.eventList as event (event.id)}
          <div>{event.name}</div>
        {/each}
      </div>
    </div>
    <div class="w-1/2 bg-gray-900 p-4 h-full">
      <h3>Input</h3>
    </div>
  </div>
</div>
