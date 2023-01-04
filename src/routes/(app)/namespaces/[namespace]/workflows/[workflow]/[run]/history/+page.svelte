<script lang="ts">
  import type { PageData } from './$types';
  import { page } from '$app/stores';
  import { eventViewType } from '$lib/stores/event-view';

  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';
  import WorkflowHistoryLayout from '$lib/layouts/workflow-history-layout.svelte';
  import WorkflowHistoryFeed from '$lib/pages/workflow-history-feed.svelte';
  import WorkflowHistoryJson from '$lib/pages/workflow-history-json.svelte';
  import WorkflowHistoryCompact from '$lib/pages/workflow-history-compact.svelte';

  import PageTitle from '$lib/components/page-title.svelte';

  export let data: PageData;

  $: ({ workflow, workers } = data);
  $: isCloud = $page.data?.settings?.runtimeEnvironment?.isCloud;

  const views = {
    feed: WorkflowHistoryFeed,
    compact: WorkflowHistoryCompact,
    json: WorkflowHistoryJson,
  };
  $: view = views[$eventViewType] ?? WorkflowHistoryFeed;
</script>

<PageTitle title={`Workflow History | ${workflow.id}`} url={$page.url.href} />
<WorkflowRunLayout cancelEnabled={!isCloud} signalEnabled={!isCloud}>
  <WorkflowHistoryLayout {workflow} {workers}>
    <!-- <svelte:fragment slot="timeline">
    <EventHistoryTimelineContainer />
    </svelte:fragment> -->
    <svelte:component this={view} />
  </WorkflowHistoryLayout>
</WorkflowRunLayout>
