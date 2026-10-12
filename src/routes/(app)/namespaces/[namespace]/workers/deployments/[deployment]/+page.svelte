<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import Deployment from '$lib/pages/deployment.svelte';
  import { namespaceRegionsFromReplication } from '$lib/utilities/compute-regions';
  import { namespaceRegionsFromEnv } from '$lib/utilities/env-regions';

  const deployment = $derived(page.params.deployment);
  // Self-hosted: the Namespace's clusters, unless a development setting
  // stands in for them. A consumer such as Temporal Cloud passes its own.
  const namespaceRegions = $derived(
    namespaceRegionsFromEnv() ??
      namespaceRegionsFromReplication(page.data.namespace),
  );
</script>

<PageTitle
  title="{translate('deployments.deployment')} | {deployment}"
  url={page.url.href}
/>
<Deployment {namespaceRegions} />
