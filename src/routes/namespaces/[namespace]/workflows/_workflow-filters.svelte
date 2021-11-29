<script lang="ts">
  import { namespace } from '$lib/stores/namespace';
  import { createWorkflowStore } from '$lib/stores/workflows';

  import Select from '$lib/components/filter-select.svelte';
  import TimeRangeSelect from '$lib/components/time-range-select.svelte';

  export let timeFormat: string = 'relative';

  $: store = createWorkflowStore($namespace);
  $: range = store.range;
</script>

<section class="p-4 flex gap-8">
  <TimeRangeSelect {range} key="workflows" />
  <Select
    id="filter-by-relative-time"
    name="Time Format"
    bind:value={timeFormat}
  >
    <option value={'relative'}>Relative</option>
    <option value={'UTC'}>UTC</option>
    <option value={'current'}>Current</option>
  </Select>
</section>
