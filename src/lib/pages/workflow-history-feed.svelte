<script lang="ts">
  import { page } from '$app/stores';

  import { timelineEvents } from '$lib/stores/events';
  import EventSummary from '$lib/components/event/event-summary.svelte';
  import PageTitle from '$lib/holocene/page-title.svelte';
  import { events, eventGroups } from '$lib/stores/events';
  import { onDestroy } from 'svelte';

  onDestroy(() => {
    $timelineEvents = null;
  });
</script>

<PageTitle
  title={`Workflow History | ${$page.params?.workflow}`}
  url={$page.url.href}
/>
<EventSummary items={$events} groups={$eventGroups} />
