<script lang="ts">
  import { onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { clearPreviousEventParameters } from '$lib/stores/previous-events';

  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';
  import WorkflowHistoryLayout from '$lib/layouts/workflow-history-layout.svelte';
  import WorkflowHistoryFeed from '$lib/pages/workflow-history-feed.svelte';
  import WorkflowHistoryJson from '$lib/pages/workflow-history-json.svelte';
  import WorkflowHistoryCompact from '$lib/pages/workflow-history-compact.svelte';

  import PageTitle from '$lib/components/page-title.svelte';

  onDestroy(() => {
    clearPreviousEventParameters();
  });

  const workflow = $page.params.workflow;

  $: compactPage = $page.url.pathname.endsWith('compact');
  $: jsonPage = $page.url.pathname.endsWith('json');
</script>

<PageTitle title={`Workflow History | ${workflow}`} url={$page.url.href} />
<WorkflowRunLayout cancelEnabled>
  <WorkflowHistoryLayout>
    <!-- <svelte:fragment slot="timeline">
    <EventHistoryTimelineContainer />
    </svelte:fragment> -->
    {#if jsonPage}
      <WorkflowHistoryJson />
    {:else if compactPage}
      <WorkflowHistoryCompact />
    {:else}
      <WorkflowHistoryFeed />
    {/if}
  </WorkflowHistoryLayout>
</WorkflowRunLayout>
