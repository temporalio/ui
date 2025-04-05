<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import StartWorkflow from '$lib/pages/start-workflow.svelte';
</script>

<PageTitle title="Start Workflow" url={$page.url.href} />
<StartWorkflow />
