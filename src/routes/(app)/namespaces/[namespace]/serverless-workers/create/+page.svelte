<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import ServerlessWorkerCreate from '$lib/pages/serverless-worker-create.svelte';
  import { routeForWorkers } from '$lib/utilities/route-for';

  const namespace = $derived(page.params.namespace);
  const workersHref = $derived(routeForWorkers({ namespace }));
</script>

<PageTitle
  title={translate('workers.create-serverless-title')}
  url={page.url.href}
/>
<div class="flex flex-col gap-4">
  <Link href={workersHref} icon="chevron-left">
    {translate('workers.back-to-workers')}
  </Link>
  <h1 class="text-2xl font-semibold">
    {translate('workers.create-serverless-title')}
  </h1>
  <ServerlessWorkerCreate {namespace} onSuccess={() => goto(workersHref)} />
</div>
