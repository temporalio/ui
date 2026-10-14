<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconChevronLeft } from '$lib/io/icon';
  import ServerlessWorkerCreate from '$lib/pages/serverless-worker-create.svelte';
  import { namespaceRegionsFromEnv } from '$lib/utilities/env-regions';
  import { routeForWorkerDeployments } from '$lib/utilities/route-for';

  const namespace = $derived(page.params.namespace);
  const deploymentsHref = $derived(routeForWorkerDeployments({ namespace }));
  // A self-hosted server has no host region for region_ids to match, so it
  // offers no high availability. A development setting can stand in for a
  // consumer such as Temporal Cloud, which passes its own config.
  const providerConfig = $derived({ regions: namespaceRegionsFromEnv() });
</script>

<PageTitle
  title={translate('workers.create-serverless-title')}
  url={page.url.href}
/>
<div class="flex flex-col gap-4">
  <Link href={deploymentsHref} LeadingIcon={IconChevronLeft}>
    {translate('workers.back-to-deployments')}
  </Link>
  <h1>
    {translate('workers.create-serverless-title')}
  </h1>
  <ServerlessWorkerCreate
    {namespace}
    {providerConfig}
    onSuccess={() => goto(deploymentsHref)}
  />
</div>
