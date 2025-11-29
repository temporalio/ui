<script lang="ts">
  import { page } from '$app/state';

  import type { PageProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import ScheduleView from '$lib/pages/schedule-view.svelte';

  let { params }: PageProps = $props();
  const { schedule } = $derived(params);
</script>

<PageTitle title={`Schedule | ${schedule}`} url={page.url.href} />
<ScheduleView {...params} scheduleId={schedule} />
