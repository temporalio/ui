<svelte:options runes />

<script lang="ts">
  import FilterBar from '$lib/components/search-attribute-filter/filter-bar.svelte';
  import { nexusOperationFilters } from '$lib/stores/filters';
  import {
    nexusOperationRefresh,
    nexusOperationsQuery,
  } from '$lib/stores/nexus-operations';
  import {
    nexusOperationSearchAttributeOptions,
    nexusOperationSearchAttributes,
  } from '$lib/stores/search-attributes';

  function onManualSearch(query: string) {
    $nexusOperationsQuery = query;
    $nexusOperationRefresh = Date.now();
  }
</script>

<FilterBar
  filters={nexusOperationFilters}
  options={$nexusOperationSearchAttributeOptions}
  searchAttributes={$nexusOperationSearchAttributes}
  id="nexus-operation"
  statusAttribute="ExecutionStatus"
  {onManualSearch}
/>
