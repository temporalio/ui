<script lang="ts">
  import { workflowFilters } from '$lib/stores/filters';
  import { searchInputViewOpen } from '$lib/stores/filters';
  import { refresh } from '$lib/stores/workflows';

  import SearchAttributeFilter from './filter.svelte';
</script>

<SearchAttributeFilter
  showFilter={!$searchInputViewOpen}
  bind:filters={$workflowFilters}
  refresh={() => {
    $refresh = Date.now();
  }}
></SearchAttributeFilter>
