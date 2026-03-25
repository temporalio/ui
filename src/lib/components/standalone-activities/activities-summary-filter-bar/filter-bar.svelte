<script lang="ts">
  import FilterBar from '$lib/components/shared-search-attribute-filter/filter-bar.svelte';
  import { activitiesQuery, activityRefresh } from '$lib/stores/activities';
  import { activityFilters } from '$lib/stores/filters';
  import { activitySearchAttributeOptions } from '$lib/stores/search-attributes';
  import { activitySearchAttributes } from '$lib/stores/search-attributes';
  function onManualSearch(query: string) {
    $activitiesQuery = query;
    $activityRefresh = Date.now();
  }
</script>

<FilterBar
  filters={activityFilters}
  options={$activitySearchAttributeOptions}
  searchAttributes={$activitySearchAttributes}
  id="activity"
  statusAttribute="ExecutionStatus"
  {onManualSearch}
/>
