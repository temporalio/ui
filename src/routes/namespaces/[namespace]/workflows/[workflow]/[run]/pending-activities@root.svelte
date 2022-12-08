<script lang="ts">
  import { page } from '$app/stores';

  import WorkflowPendingActivities from '$lib/pages/workflow-pending-activities.svelte';

  import WorkflowRunLayout from '$lib/layouts/workflow-run-layout.svelte';
  import PageTitle from '$lib/components/page-title.svelte';

  const workflow = $page.params.workflow;
</script>

<PageTitle title={`Pending Activities | ${workflow}`} url={$page.url.href} />
<WorkflowRunLayout cancelEnabled>
  <WorkflowPendingActivities />
</WorkflowRunLayout>
