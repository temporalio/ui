<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkerDeploymentVersionCreatePage from '$lib/pages/worker-deployment-version-create.svelte';
  import { namespaceRegionsFromEnv } from '$lib/utilities/env-regions';
  import { routeForWorkerDeployment } from '$lib/utilities/route-for';

  const namespace = $derived(page.params.namespace);
  const deployment = $derived(page.params.deployment);
  const backHref = $derived(
    routeForWorkerDeployment({ namespace, deployment }),
  );
  // A self-hosted server has no host region for region_ids to match, so it
  // offers no high availability. A development setting can stand in for a
  // consumer such as Temporal Cloud, which passes its own config.
  const providerConfig = $derived({ regions: namespaceRegionsFromEnv() });
</script>

<PageTitle
  title={translate('workers.create-version-title')}
  url={page.url.href}
/>
<WorkerDeploymentVersionCreatePage
  {namespace}
  {deployment}
  {providerConfig}
  onSuccess={() => goto(backHref)}
/>
