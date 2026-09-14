<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkerDetails from '$lib/pages/worker-details.svelte';

  const workerInstanceKey = $derived(page.params.workerInstanceKey);
</script>

<PageTitle
  title="{translate('workers.workers')} | {workerInstanceKey}"
  url={page.url.href}
/>
<WorkerDetails />
