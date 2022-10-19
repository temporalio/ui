<script lang="ts">
  import { page } from '$app/stores';

  import WorkflowStackTrace from '$lib/pages/workflow-stack-trace.svelte';
  import PageTitle from '$lib/holocene/page-title.svelte';
</script>

<PageTitle
  title={`Stack Trace | ${$page.params?.workflow}`}
  url={$page.url.href}
/>
<WorkflowStackTrace />
