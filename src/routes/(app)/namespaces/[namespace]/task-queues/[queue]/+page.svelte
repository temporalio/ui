<script lang="ts">
  import { page } from '$app/state';

  import type { PageProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import TaskQueue from '$lib/pages/task-queue.svelte';

  let { params }: PageProps = $props();
  const { queue } = $derived(params);
</script>

<PageTitle title={`Task Queue | ${queue}`} url={page.url.href} />
<TaskQueue {...params} />
