<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkersLayout from '$lib/layouts/workers-layout.svelte';
  import WorkerDeployments from '$lib/pages/deployments.svelte';
  import {
    routeForWorkerDeployments,
    routeForWorkers,
  } from '$lib/utilities/route-for';

  const namespace = $derived(page.params.namespace);
  const deploymentsHref = $derived(routeForWorkerDeployments({ namespace }));
  const workersHref = $derived(routeForWorkers({ namespace }));
</script>

<PageTitle
  title={translate('deployments.worker-deployments')}
  url={page.url.href}
/>
<WorkersLayout {workersHref} {deploymentsHref}>
  <WorkerDeployments />
</WorkersLayout>
