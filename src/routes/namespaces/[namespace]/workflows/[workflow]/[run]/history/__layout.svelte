<script lang="ts">
  import { page } from '$app/stores';
  import { workflowRun } from '$lib/stores/workflow-run';

  import WorkflowHistoryLayout from '$lib/layouts/workflow-history-layout.svelte';
  import PageTitle from '$lib/components/page-title.svelte';

  const workflow = $page.params.workflow;
</script>

<PageTitle title={`Workflow History | ${workflow}`} url={$page.url.href} />
<WorkflowHistoryLayout>
  <!-- <svelte:fragment slot="timeline">
    <EventHistoryTimelineContainer />
  </svelte:fragment> -->
  <slot />
</WorkflowHistoryLayout>
