<script lang="ts">
  import { page } from '$app/stores';
  import PageTitle from '$holocene/page-title.svelte';

  import ScheduleView from '$lib/pages/schedule-view.svelte';

  let scheduleId = $page.params.schedule;
</script>

<PageTitle title={`Schedule | ${scheduleId}`} url={$page.url.href} />
<ScheduleView />
