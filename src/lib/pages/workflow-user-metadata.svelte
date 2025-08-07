<script>
  import WorkflowCurrentDetails from '$lib/components/workflow/metadata/workflow-current-details.svelte';
  import WorkflowSummaryAndDetails from '$lib/components/workflow/metadata/workflow-summary-and-details.svelte';
</script>

<div class="flex flex-col bg-primary lg:flex-row">
  <WorkflowSummaryAndDetails />
  <WorkflowCurrentDetails />
</div>
