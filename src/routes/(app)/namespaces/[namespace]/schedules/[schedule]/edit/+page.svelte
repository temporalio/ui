<script lang="ts">
  import { page } from '$app/state';

  import type { PageProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import ScheduleEdit from '$lib/pages/schedule-edit.svelte';

  let { params }: PageProps = $props();
  const { schedule } = $derived(params);
</script>

<PageTitle title={`Schedule Edit | ${schedule}`} url={page.url.href} />
<ScheduleEdit {...params} />
