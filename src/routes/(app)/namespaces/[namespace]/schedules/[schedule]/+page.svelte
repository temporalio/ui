<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import ScheduleView from '$lib/pages/schedule-view.svelte';

  const schedule = $derived(page.params.schedule);
</script>

<PageTitle title={`Schedule | ${schedule}`} url={page.url.href} />
<ScheduleView />
