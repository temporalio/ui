<script>
  import WorkflowCurrentDetails from '$lib/components/workflow/metadata/workflow-current-details.svelte';
  import WorkflowSummaryAndDetails from '$lib/components/workflow/metadata/workflow-summary-and-details.svelte';
</script>

<div class="flex h-full flex-col gap-6 bg-primary lg:flex-row">
  <WorkflowSummaryAndDetails />
  <WorkflowCurrentDetails />
</div>
