<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import Deployment from '$lib/pages/deployment.svelte';
  import { demoNamespaceRegions } from '$lib/utilities/demo-namespace-regions';

  const deployment = $derived(page.params.deployment);
  const namespaceRegions = demoNamespaceRegions();
</script>

<PageTitle
  title="{translate('deployments.deployment')} | {deployment}"
  url={page.url.href}
/>
<Deployment {namespaceRegions} />
