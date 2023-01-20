<script lang="ts">
  import { page } from '$app/stores';
  import { eventViewType } from '$lib/stores/event-view';

  import WorkflowHistoryLayout from '$lib/layouts/workflow-history-layout.svelte';
  import WorkflowHistoryFeed from '$lib/pages/workflow-history-feed.svelte';
  import WorkflowHistoryJson from '$lib/pages/workflow-history-json.svelte';
  import WorkflowHistoryCompact from '$lib/pages/workflow-history-compact.svelte';

  import PageTitle from '$lib/components/page-title.svelte';
  const workflow = $page.params.workflow;

  const views = {
    feed: WorkflowHistoryFeed,
    compact: WorkflowHistoryCompact,
    json: WorkflowHistoryJson,
  };
  $: view = views[$eventViewType] ?? WorkflowHistoryFeed;
</script>

<PageTitle title={`Workflow History | ${workflow}`} url={$page.url.href} />
<WorkflowHistoryLayout>
  <!-- <svelte:fragment slot="timeline">
    <EventHistoryTimelineContainer />
    </svelte:fragment> -->
  <svelte:component this={view} />
</WorkflowHistoryLayout>
