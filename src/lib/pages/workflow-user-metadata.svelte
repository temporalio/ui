<script lang="ts">
  import WorkflowCurrentDetails from '$lib/components/workflow/metadata/workflow-current-details.svelte';
  import WorkflowSummaryAndDetails from '$lib/components/workflow/metadata/workflow-summary-and-details.svelte';

  interface Props {
    namespace: string;
  }

  let { namespace }: Props = $props();
</script>

<div class="flex flex-col bg-primary lg:flex-row">
  <WorkflowSummaryAndDetails />
  <WorkflowCurrentDetails {namespace} />
</div>
