<script lang="ts">
  import { page } from '$app/stores';

  import { importEventGroups } from '$lib/stores/import-events';
  import CompactEvent from '$lib/components/event/view/event-compact.svelte';

  $: category = $page.url.searchParams.get('category') as EventTypeCategory;
  $: filteredEventGroups = $importEventGroups.filter(
    (event: CompactEventGroups) => {
      if (category) return event.category === category;
      return event;
    },
  );
</script>

<CompactEvent items={filteredEventGroups} />
