<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import WorkerSearchTable from '$lib/components/workers/worker-search-table.svelte';
  import { translate } from '$lib/i18n/translate';

  const { namespace } = $derived(page.params);
</script>

<PageTitle title="Workers" url={page.url.href} />
<header class="flex flex-col gap-2">
  <h1 class="leading-7" data-cy="workers-title">
    {translate('workers.workers')}
  </h1>
</header>
<WorkerSearchTable {namespace} />
