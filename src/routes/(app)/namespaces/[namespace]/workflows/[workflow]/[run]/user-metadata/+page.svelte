<script>
  import WorkflowCurrentDetails from '$lib/components/workflow/metadata/workflow-current-details.svelte';
  import WorkflowSummaryAndDetails from '$lib/components/workflow/metadata/workflow-summary-and-details.svelte';
  import EmptyState from '$lib/holocene/empty-state.svelte';
  import { translate } from '$lib/i18n/translate';
  import { workflowRun } from '$lib/stores/workflow-run';
  const summary = $derived($workflowRun?.userMetadata?.summary);
  const details = $derived($workflowRun?.userMetadata?.details);
  const currentDetails = $derived($workflowRun?.metadata?.currentDetails);
</script>

<div class="flex flex-col gap-6 bg-primary lg:flex-row">
  {#if summary.length || details.length}
    <WorkflowSummaryAndDetails />
  {/if}
  {#if currentDetails != undefined}
    <WorkflowCurrentDetails />
  {/if}
  {#if !summary.length && !details.length && !currentDetails}
    <EmptyState title={translate('workflows.no-user-metadata')}
      >{translate('workflows.check-back')}</EmptyState
    >
  {/if}
</div>
