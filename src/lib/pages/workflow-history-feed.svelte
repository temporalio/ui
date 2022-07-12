<script lang="ts">
  import { page } from '$app/stores';

  import EventSummary from '$lib/components/event/event-summary.svelte';
  import PageTitle from '$lib/holocene/page-title.svelte';
  import { events, eventGroups } from '$lib/stores/events';

  const workflow = $page.params?.workflow;
</script>

<PageTitle title={`Workflow History | ${workflow}`} url={$page.url.href} />
<EventSummary items={$events} groups={$eventGroups} />
