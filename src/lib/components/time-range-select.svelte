<script lang="ts">
  import type { Writable } from 'svelte/store';
  import { toDuration, toString } from '$lib/utilities/to-duration';

  import Select from '$lib/components/filter-select.svelte';

  const updateRange = (event: Event) => {
    const target = event.target as HTMLSelectElement;
    const duration = toDuration(target.value);
    $range = duration;
  };

  export let key: string;
  export let range: Writable<Duration>;

  const durations: { [key: string]: Duration } = {
    '10 minutes': { minutes: 10 },
    '60 minutes': { minutes: 60 },
    '3 hours': { hours: 3 },
    '24 hours': { hours: 24 },
    '3 days': { days: 3 },
    '7 days': { days: 7 },
    '30 days': { days: 30 },
    '90 days': { days: 3 },
  };
</script>

<Select
  id={`${key}-time-range`}
  name="Time Range"
  value={toString($range)}
  on:change={updateRange}
>
  <option value={null} />
  {#each Object.keys(durations) as duration}
    <option value={duration}>Last {duration}</option>
  {/each}
</Select>
