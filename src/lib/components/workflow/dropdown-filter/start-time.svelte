<script lang="ts">
  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import { workflowFilters, workflowSorts } from '$lib/stores/filters';
  import Sort from './sort.svelte';

  $: typeSort = $workflowSorts.find((s) => s.attribute === 'StartTime');
</script>

<DropdownMenu value={typeSort?.value ?? ''} keepOpen right>
  <svelte:fragment slot="label">Start Time</svelte:fragment>
  <div class="flex w-44 flex-col gap-2 p-2">
    <Sort type="StartTime" />
  </div>
</DropdownMenu>
