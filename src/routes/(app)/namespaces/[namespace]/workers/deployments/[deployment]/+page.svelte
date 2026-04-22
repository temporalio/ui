<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import Deployment from '$lib/pages/deployment.svelte';

  const deployment = $derived(page.params.deployment);
</script>

<PageTitle
  title="{translate('deployments.deployment')} | {deployment}"
  url={page.url.href}
/>
<Deployment />
