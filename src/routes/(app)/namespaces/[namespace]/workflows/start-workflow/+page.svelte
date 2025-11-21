<script lang="ts">
  import { page } from '$app/state';

  import type { PageProps } from './$types';

  import PageTitle from '$lib/components/page-title.svelte';
  import StartWorkflow from '$lib/pages/start-workflow.svelte';

  let { params }: PageProps = $props();
</script>

<PageTitle title="Start Workflow" url={page.url.href} />
<StartWorkflow {...params} />
