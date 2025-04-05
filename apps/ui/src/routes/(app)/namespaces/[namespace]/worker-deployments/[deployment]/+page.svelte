<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import Deployment from '$lib/pages/deployment.svelte';

  const deployment = $page.params.deployment;
</script>

<PageTitle title={`Deployment | ${deployment}`} url={$page.url.href} />
<Deployment />
