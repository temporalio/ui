<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkersLayout from '$lib/layouts/workers-layout.svelte';
  import WorkerDeployments from '$lib/pages/deployments.svelte';
  import { namespaceRegionsFromReplication } from '$lib/utilities/compute-regions';
  import { namespaceRegionsFromEnv } from '$lib/utilities/env-regions';
  import { routeForWorkerDeploymentCreate } from '$lib/utilities/route-for';

  const namespace = $derived(page.params.namespace);
  // Self-hosted: the Namespace's clusters, unless a development setting
  // stands in for them. A consumer such as Temporal Cloud passes its own.
  const namespaceRegions = $derived(
    namespaceRegionsFromEnv() ??
      namespaceRegionsFromReplication(page.data.namespace),
  );
  const createHref = $derived(routeForWorkerDeploymentCreate({ namespace }));
</script>

<PageTitle
  title={translate('deployments.worker-deployments')}
  url={page.url.href}
/>
<WorkersLayout {namespace}>
  {#snippet headerAction()}
    <Button variant="primary" href={createHref}>
      {translate('workers.create-serverless-worker')}
    </Button>
  {/snippet}
  <WorkerDeployments {namespaceRegions} />
</WorkersLayout>
