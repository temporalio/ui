<script lang="ts">
  import { page } from '$app/stores';

  import EventSummary from '$lib/components/event/event-summary.svelte';
  import PageTitle from '$lib/holocene/page-title.svelte';
  import { ascendingEventGroups } from '$lib/stores/events';
</script>

<PageTitle
  title={`Workflow History | ${$page.params?.workflow}`}
  url={$page.url.href}
/>
<EventSummary
  items={$ascendingEventGroups}
  groups={$ascendingEventGroups}
  compact={true}
/>
