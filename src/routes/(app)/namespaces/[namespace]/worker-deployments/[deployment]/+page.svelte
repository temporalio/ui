<script lang="ts">
  import { page } from '$app/state';

  import type { PageProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import Deployment from '$lib/pages/deployment.svelte';

  let { params }: PageProps = $props();
</script>

<PageTitle title={`Deployment | ${params.deployment}`} url={page.url.href} />
<Deployment {...params} />
