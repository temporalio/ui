<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkerDeploymentVersionCreatePage from '$lib/pages/worker-deployment-version-create.svelte';
  import { namespaceRegionsFromReplication } from '$lib/utilities/compute-regions';
  import { namespaceRegionsFromEnv } from '$lib/utilities/env-regions';
  import { routeForWorkerDeployment } from '$lib/utilities/route-for';

  const namespace = $derived(page.params.namespace);
  const deployment = $derived(page.params.deployment);
  const backHref = $derived(
    routeForWorkerDeployment({ namespace, deployment }),
  );
  // Self-hosted: the Namespace's clusters, unless a development setting
  // stands in for them. A consumer such as Temporal Cloud passes its own.
  const namespaceRegions = $derived(
    namespaceRegionsFromEnv() ??
      namespaceRegionsFromReplication(page.data.namespace),
  );
</script>

<PageTitle
  title={translate('workers.create-version-title')}
  url={page.url.href}
/>
<WorkerDeploymentVersionCreatePage
  {namespace}
  {deployment}
  {namespaceRegions}
  onSuccess={() => goto(backHref)}
/>
