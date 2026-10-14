<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkersLayout from '$lib/layouts/workers-layout.svelte';
  import WorkerDeployments from '$lib/pages/deployments.svelte';
  import { namespaceRegionsFromEnv } from '$lib/utilities/env-regions';
  import { routeForWorkerDeploymentCreate } from '$lib/utilities/route-for';

  const namespace = $derived(page.params.namespace);
  // A self-hosted server has no host region for region_ids to match, so it
  // offers no high availability. A development setting can stand in for a
  // consumer such as Temporal Cloud, which passes its own config.
  const providerConfig = $derived({ regions: namespaceRegionsFromEnv() });
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
  <WorkerDeployments {providerConfig} />
</WorkersLayout>
