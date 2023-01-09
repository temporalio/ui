<script lang="ts">
  import { page } from '$app/stores';
  import { eventViewType } from '$lib/stores/event-view';
  import { settings } from '$lib/stores/settings';

  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';
  import WorkflowHistoryLayout from '$lib/layouts/workflow-history-layout.svelte';
  import WorkflowHistoryFeed from '$lib/pages/workflow-history-feed.svelte';
  import WorkflowHistoryJson from '$lib/pages/workflow-history-json.svelte';
  import WorkflowHistoryCompact from '$lib/pages/workflow-history-compact.svelte';

  import PageTitle from '$lib/components/page-title.svelte';
  import { workflowCancelEnabled } from '$lib/utilities/workflow-cancel-enabled';
  import { workflowSignalEnabled } from '$lib/utilities/workflow-signal-enabled';
  import { workflowTerminateEnabled } from '$lib/utilities/workflow-terminate-enabled';

  const workflow = $page.params.workflow;

  const views = {
    feed: WorkflowHistoryFeed,
    compact: WorkflowHistoryCompact,
    json: WorkflowHistoryJson,
  };
  $: view = views[$eventViewType] ?? WorkflowHistoryFeed;
</script>

<PageTitle title={`Workflow History | ${workflow}`} url={$page.url.href} />
<WorkflowRunLayout
  cancelEnabled={workflowCancelEnabled($page.data.settings)}
  signalEnabled={workflowSignalEnabled($page.data.settings)}
  terminateEnabled={workflowTerminateEnabled($page.data.settings)}
>
  <WorkflowHistoryLayout>
    <!-- <svelte:fragment slot="timeline">
    <EventHistoryTimelineContainer />
    </svelte:fragment> -->
    <svelte:component this={view} />
  </WorkflowHistoryLayout>
</WorkflowRunLayout>
