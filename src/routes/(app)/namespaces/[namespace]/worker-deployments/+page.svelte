<script lang="ts">
  import { page } from '$app/state';

  import type { PageProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import WorkerDeployments from '$lib/pages/deployments.svelte';

  let { params }: PageProps = $props();
</script>

<PageTitle title="Deployments" url={page.url.href} />
<WorkerDeployments {...params} />
