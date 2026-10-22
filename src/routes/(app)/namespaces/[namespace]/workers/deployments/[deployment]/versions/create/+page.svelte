<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkerDeploymentVersionCreatePage from '$lib/pages/worker-deployment-version-create.svelte';
  import { routeForWorkerDeployment } from '$lib/utilities/route-for';

  const namespace = $derived(page.params.namespace);
  const deployment = $derived(page.params.deployment);
  const backHref = $derived(
    routeForWorkerDeployment({ namespace, deployment }),
  );
  // No providerConfig: a self-hosted server has no host region for a scaling
  // group's region_ids to match, so it offers no high availability. A consumer
  // such as Temporal Cloud passes its own.
</script>

<PageTitle
  title={translate('workers.create-version-title')}
  url={page.url.href}
/>
<WorkerDeploymentVersionCreatePage
  {namespace}
  {deployment}
  onSuccess={() => goto(backHref)}
/>
