<script>
  import WorkflowCurrentDetails from '$lib/components/workflow/metadata/workflow-current-details.svelte';
  import WorkflowSummaryAndDetails from '$lib/components/workflow/metadata/workflow-summary-and-details.svelte';
</script>

<div class="grid grid-cols-1 border border-subtle bg-primary lg:grid-cols-2">
  <WorkflowSummaryAndDetails />
  <WorkflowCurrentDetails />
</div>
