<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import SetupGuideToggle from '$lib/components/workers/serverless-worker-form/setup-guide-toggle.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import ServerlessWorkerCreate from '$lib/pages/serverless-worker-create.svelte';
  import { routeForWorkerDeployments } from '$lib/utilities/route-for';

  const namespace = $derived(page.params.namespace);
  const deploymentsHref = $derived(routeForWorkerDeployments({ namespace }));
</script>

<PageTitle
  title={translate('workers.create-serverless-title')}
  url={page.url.href}
/>
<div class="flex flex-col gap-4">
  <Link href={deploymentsHref} icon="chevron-left">
    {translate('workers.back-to-deployments')}
  </Link>
  <div
    class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
  >
    <h1>
      {translate('workers.create-serverless-title')}
    </h1>
    <SetupGuideToggle />
  </div>
  <ServerlessWorkerCreate {namespace} onSuccess={() => goto(deploymentsHref)} />
</div>
