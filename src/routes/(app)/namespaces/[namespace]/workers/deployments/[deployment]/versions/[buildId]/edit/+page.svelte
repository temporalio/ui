<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkerDeploymentVersionEdit from '$lib/pages/worker-deployment-version-edit.svelte';
  import { namespaceRegionsFromReplication } from '$lib/utilities/compute-regions';
  import { namespaceRegionsFromEnv } from '$lib/utilities/env-regions';

  const namespace = $derived(page.params.namespace);
  const deployment = $derived(page.params.deployment);
  const buildId = $derived(page.params.buildId);
  // Self-hosted: the Namespace's clusters, unless a development setting
  // stands in for them. A consumer such as Temporal Cloud passes its own.
  const namespaceRegions = $derived(
    namespaceRegionsFromEnv() ??
      namespaceRegionsFromReplication(page.data.namespace),
  );
</script>

<PageTitle
  title={translate('workers.edit-version-title')}
  url={page.url.href}
/>
<WorkerDeploymentVersionEdit
  {namespace}
  {deployment}
  {buildId}
  {namespaceRegions}
/>
