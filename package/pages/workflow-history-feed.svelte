<script>var _a;
import { page } from '$app/stores';
import { timelineEvents } from '../stores/events';
import EventSummary from '../components/event/event-summary.svelte';
import PageTitle from '../holocene/page-title.svelte';
import { events, eventGroups } from '../stores/events';
import { onDestroy } from 'svelte';
onDestroy(() => {
    $timelineEvents = null;
});
const workflow = (_a = $page.params) === null || _a === void 0 ? void 0 : _a.workflow;
</script>

<PageTitle title={`Workflow History | ${workflow}`} url={$page.url.href} />
<EventSummary items={$events} groups={$eventGroups} />
