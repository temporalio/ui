<script lang="ts">
  import { page } from '$app/state';

  import type { PageProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import WorkflowsWithNewSearch from '$lib/pages/workflows-with-new-search.svelte';

  let { params }: PageProps = $props();
  const { namespace } = $derived(params);
</script>

<PageTitle title={`Workflows | ${namespace}`} url={page.url.href} />

<WorkflowsWithNewSearch {...params} />
