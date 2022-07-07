<script lang="ts">
  import { page } from '$app/stores';

  import EventSummary from '$lib/components/event/event-summary.svelte';
  import { events, eventGroups } from '$lib/stores/events';
  import { title } from '$lib/stores/page';

  $title = `Workflow History | ${$page.params?.workflow}`;
</script>

<EventSummary items={$events} groups={$eventGroups} />
