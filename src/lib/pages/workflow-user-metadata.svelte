<script>
  import UserMetadata from '$lib/components/user-metadata.svelte';
  import WorkflowCurrentDetails from '$lib/components/workflow/metadata/workflow-current-details.svelte';
  import { workflowRun } from '$lib/stores/workflow-run';
</script>

<div class="flex flex-col bg-primary lg:flex-row">
  <UserMetadata
    summary={$workflowRun.userMetadata.summary}
    details={$workflowRun.userMetadata.details}
  />
  <WorkflowCurrentDetails />
</div>
