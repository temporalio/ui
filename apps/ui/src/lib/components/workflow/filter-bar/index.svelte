<script lang="ts">
  import FilterBar from '$lib/components/search-attribute-filter/filter-bar.svelte';
  import { workflowFilters } from '$lib/stores/filters';
  import {
    searchAttributes,
    sortedSearchAttributeOptions,
  } from '$lib/stores/search-attributes';
  import { refresh } from '$lib/stores/workflows';

  const onManualSearch = () => {
    $refresh = Date.now();
  };
</script>

<FilterBar
  filters={workflowFilters}
  options={$sortedSearchAttributeOptions}
  searchAttributes={$searchAttributes}
  id="workflow"
  {onManualSearch}
/>
