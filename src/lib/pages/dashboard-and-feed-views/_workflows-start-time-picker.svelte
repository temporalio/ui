<script lang="ts">
  import { durations } from '$lib/utilities/to-duration';

  import { workflowFilters, workflowSorts } from '$lib/stores/filters';
  import { updateQueryParamsFromFilter } from '$lib/utilities/query/to-list-workflow-filters';
  import { page } from '$app/stores';
  import MenuItem from '$lib/holocene/primitives/menu/menu-item.svelte';
  import DropdownButton from '$lib/holocene/dropdown-button/dropdown-button.svelte';

  let custom = false;
  let value = 'All Time';
  let timeField = 'StartTime';

  $: timeFilter = $workflowFilters.find(
    (f) => f.attribute === 'StartTime' || f.attribute === 'CloseTime',
  );

  const setTimeValues = () => {
    if (!timeFilter) {
      value = 'All Time';
      timeField = 'StartTime';
    } else {
      value = custom ? 'Custom' : timeFilter.value;
      timeField = timeFilter.attribute as string;
    }
  };

  $: timeFilter, setTimeValues();

  const getOtherFilters = () =>
    $workflowFilters.filter(
      (f) => f.attribute !== 'StartTime' && f.attribute !== 'CloseTime',
    );

  const onChange = (_value: string) => {
    value = _value;
    if (value === 'All Time') {
      $workflowFilters = [...getOtherFilters()];
      custom = false;
    } else if (value === 'Custom') {
      custom = true;
    } else {
      const filter = {
        attribute: timeField,
        value,
        conditional: '=',
        operator: '',
        parenthesis: '',
      };
      $workflowFilters = [...getOtherFilters(), filter];
      custom = false;
    }

    updateQueryParamsFromFilter($page.url, $workflowFilters, $workflowSorts);
  };
</script>

<DropdownButton id="time" label={value} menuClass="border-none text-lg">
  <MenuItem value="All Time" on:click={() => onChange('All Time')}
    >All Time</MenuItem
  >
  {#each durations as duration}
    <MenuItem on:click={() => onChange(duration)} value={duration}
      >{duration}</MenuItem
    >
  {/each}
</DropdownButton>

<style lang="postcss">
  .time-label {
    @apply flex cursor-pointer whitespace-nowrap px-4 py-3 font-secondary text-sm font-medium hover:bg-gray-50;
  }

  .active {
    @apply text-blue-700;
  }

  .timezone-label {
    @apply flex cursor-pointer whitespace-nowrap px-4 py-3 font-secondary text-sm font-medium hover:bg-gray-50;
  }
</style>
