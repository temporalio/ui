<script lang="ts" module>
  import { writable, type Writable } from 'svelte/store';

  import { setContext } from 'svelte';

  export const ACTIVITY_FILTER_CONTEXT = 'activity-filter-context';

  export interface ActivityFilterContext {
    filter: Writable<SearchAttributeFilter>;
    activeQueryIndex: Writable<number | null>;
    handleSubmit: () => void;
    focusedElementId: Writable<string>;
    resetFilter: () => void;
    chipOpenIndex: Writable<number | null>;
  }
</script>

<script lang="ts">
  import { afterNavigate } from '$app/navigation';

  import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
  import { activityFilters } from '$lib/stores/filters';
  import { emptyFilter } from '$lib/utilities/query/to-list-workflow-filters';

  import ActivityDropdownFilterList from './dropdown-filter-list.svelte';
  import ActivitySearchAttributeMenu from './search-attribute-menu.svelte';

  const filter = writable<SearchAttributeFilter>(emptyFilter());
  const activeQueryIndex = writable<number | null>(null);
  const focusedElementId = writable<string>('');
  const chipOpenIndex = writable<number | null>(null);

  afterNavigate(() => {
    chipOpenIndex.set(null);
  });

  setContext<ActivityFilterContext>(ACTIVITY_FILTER_CONTEXT, {
    filter,
    activeQueryIndex,
    handleSubmit,
    focusedElementId,
    resetFilter,
    chipOpenIndex,
  });

  function handleSubmit() {
    if ($activeQueryIndex !== null) {
      $activityFilters[$activeQueryIndex] = $filter;
      $activeQueryIndex = null;
    } else {
      const newIndex = $activityFilters.length;
      $activityFilters = [...$activityFilters, $filter];
      chipOpenIndex.set(newIndex);
    }
    filter.set(emptyFilter());
  }

  function resetFilter() {
    activeQueryIndex.set(null);
    filter.set(emptyFilter());
  }
</script>

<div class="flex shrink flex-wrap items-center justify-start gap-2">
  <ActivityDropdownFilterList />
  <ActivitySearchAttributeMenu />
</div>
