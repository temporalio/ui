<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import WorkerDeployments from '$lib/pages/deployments.svelte';
</script>

<PageTitle title="Deployments" url={$page.url.href} />
<WorkerDeployments />
