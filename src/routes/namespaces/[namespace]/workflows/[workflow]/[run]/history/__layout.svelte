<script lang="ts">
  import { page } from '$app/stores';

  import WorkflowHistoryLayout from '$lib/layouts/workflow-history-layout.svelte';
  import PageTitle from '$lib/holocene/page-title.svelte';
</script>

<PageTitle
  title={`Workflow History | ${$page.params.workflow}`}
  url={$page.url.href}
/>
<WorkflowHistoryLayout>
  <!-- <svelte:fragment slot="timeline">
    <EventHistoryTimelineContainer />
  </svelte:fragment> -->
  <slot />
</WorkflowHistoryLayout>
