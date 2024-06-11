<script lang="ts">
  import { page } from '$app/stores';

  import DeploymentGraph from '$lib/components/lines-and-dots/deployments/deployment-graph.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
</script>

<PageTitle title="Deployments" url={$page.url.href} />
<div class="surface-black absolute left-0 top-0 h-full min-h-screen w-full">
  <h1>Deployments</h1>
  <DeploymentGraph />
</div>
