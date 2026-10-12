<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import Deployment from '$lib/pages/deployment.svelte';
  import { namespaceRegionsFromReplication } from '$lib/utilities/compute-regions';

  const deployment = $derived(page.params.deployment);
  // Self-hosted: a Namespace's regions are the clusters it replicates to.
  const namespaceRegions = $derived(
    namespaceRegionsFromReplication(page.data.namespace),
  );
</script>

<PageTitle
  title="{translate('deployments.deployment')} | {deployment}"
  url={page.url.href}
/>
<Deployment {namespaceRegions} />
