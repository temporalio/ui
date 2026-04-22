<script lang="ts">
  import { page } from '$app/state';

  import type { PageData } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import Deployment from '$lib/pages/deployment.svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const deployment = $derived(page.params.deployment);
</script>

<PageTitle
  title="{translate('deployments.deployment')} | {deployment}"
  url={page.url.href}
/>
<Deployment deploymentPromise={data.deploymentPromise} />
