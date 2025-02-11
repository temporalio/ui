<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import DeploymentVersion from '$lib/pages/deployment-version.svelte';

  const version = $page.params.version;
</script>

<PageTitle title={`Version | ${version}`} url={$page.url.href} />
<DeploymentVersion />
