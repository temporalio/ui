<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import Deployment from '$lib/pages/deployment.svelte';

  const deployment = $derived(page.params.deployment);
  // No providerConfig: a self-hosted server has no host region for a scaling
  // group's region_ids to match, so it offers no high availability. A consumer
  // such as Temporal Cloud passes its own.
</script>

<PageTitle
  title="{translate('deployments.deployment')} | {deployment}"
  url={page.url.href}
/>
<Deployment />
