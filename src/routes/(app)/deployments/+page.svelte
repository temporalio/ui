<script lang="ts">
  import { page } from '$app/stores';

  import DeploymentGraph from '$lib/components/lines-and-dots/deployments/deployment-graph.svelte';
  import { deployment } from '$lib/components/lines-and-dots/deployments/deployments';
  import PageTitle from '$lib/components/page-title.svelte';
</script>

<PageTitle title="Deployments" url={$page.url.href} />
<DeploymentGraph {deployment} />
