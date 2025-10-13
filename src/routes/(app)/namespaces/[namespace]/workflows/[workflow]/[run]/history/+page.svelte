<script lang="ts">
  import { onMount } from 'svelte';

  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import WorkflowComparisonView from '$lib/components/workflow/workflow-comparison-view.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowHistoryLayout from '$lib/layouts/workflow-history-layout.svelte';
  import { workflowComparison } from '$lib/stores/workflow-comparison';

  const workflow = $page.params.workflow;
  const run = $derived($page.params.run);
  const compareRunIds = $derived($page.url.searchParams.getAll('compare'));
  const isComparing = $derived($workflowComparison.isComparing);

  onMount(() => {
    if (compareRunIds.length > 0) {
      if (!$workflowComparison.isComparing) {
        workflowComparison.startComparison(workflow, run);
      }

      compareRunIds.forEach((runId) => {
        const existingComparison = $workflowComparison.comparisons.find(
          (c) => c.runId === runId,
        );
        if (!existingComparison) {
          workflowComparison.addComparison(workflow, runId, '');
        }
      });
    }
  });
</script>

<PageTitle
  title={`${translate('workflows.workflow-history')} | ${workflow}`}
  url={$page.url.href}
/>
{#if isComparing}
  <WorkflowComparisonView />
{:else}
  <WorkflowHistoryLayout />
{/if}
