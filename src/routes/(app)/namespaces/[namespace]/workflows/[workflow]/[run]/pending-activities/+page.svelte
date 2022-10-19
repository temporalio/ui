<script lang="ts">
  import { page } from '$app/stores';
  import { workflowRun } from '$lib/stores/workflow-run';

  import WorkflowPendingActivities from '$lib/pages/workflow-pending-activities.svelte';
  import PageTitle from '$lib/holocene/page-title.svelte';
</script>

<PageTitle
  title={`Pending Activities | ${$workflowRun?.workflow?.id}`}
  url={$page.url.href}
/>
<WorkflowPendingActivities />
