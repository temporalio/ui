<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import TaskQueue from '$lib/pages/task-queue.svelte';

  const { namespace, queue } = $derived(page.params);
</script>

<PageTitle
  title="{translate('workers.task-queue')} | {queue}"
  url={page.url.href}
/>
<TaskQueue {namespace} {queue} />
