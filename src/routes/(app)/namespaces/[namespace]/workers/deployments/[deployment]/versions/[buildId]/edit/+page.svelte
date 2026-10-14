<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkerDeploymentVersionEdit from '$lib/pages/worker-deployment-version-edit.svelte';
  import { namespaceRegionsFromEnv } from '$lib/utilities/env-regions';

  const namespace = $derived(page.params.namespace);
  const deployment = $derived(page.params.deployment);
  const buildId = $derived(page.params.buildId);
  // A self-hosted server has no host region for region_ids to match, so it
  // offers no high availability. A development setting can stand in for a
  // consumer such as Temporal Cloud, which passes its own config.
  const providerConfig = $derived({ regions: namespaceRegionsFromEnv() });
</script>

<PageTitle
  title={translate('workers.edit-version-title')}
  url={page.url.href}
/>
<WorkerDeploymentVersionEdit
  {namespace}
  {deployment}
  {buildId}
  {providerConfig}
/>
