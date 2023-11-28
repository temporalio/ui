<script lang="ts">
  import * as _ from 'lodash';

  import type { EventGroup } from '$lib/models/event-groups/event-groups';

  import NorthStarTimeRow from './north-star-time-row.svelte';

  export let items: EventGroup;

  $: parallelItems = _.groupBy(items, (x) => x.initialEvent.timestamp);
</script>

<div class="my-4 flex flex-col gap-2">
  {#each Object.entries(parallelItems) as [date, timeGroup]}
    <NorthStarTimeRow
      {date}
      categorizedGroups={_.groupBy(timeGroup, (group) => group.category)}
    />
  {/each}
</div>
