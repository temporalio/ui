<script>
  import UserMetadata from '$lib/components/user-metadata.svelte';
  import WorkflowCurrentDetails from '$lib/components/workflow/metadata/workflow-current-details.svelte';
  import Loading from '$lib/holocene/loading.svelte';
  import { workflowRun } from '$lib/stores/workflow-run';
</script>

{#if $workflowRun.userMetadataLoading}
  <Loading />
{:else}
  <div class="flex flex-col bg-background-primary text-primary lg:flex-row">
    <UserMetadata
      summary={$workflowRun.userMetadata.summary}
      details={$workflowRun.userMetadata.details}
    />
    <WorkflowCurrentDetails />
  </div>
{/if}
