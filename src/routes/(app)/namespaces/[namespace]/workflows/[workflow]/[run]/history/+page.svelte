<script lang="ts">
  import { page } from '$app/state';

  import TimelineAndHistoryToggle from '$lib/components/lines-and-dots/timeline-and-history-toggle.svelte';
  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowHistoryLayout from '$lib/layouts/workflow-history-layout.svelte';
  import WorkflowHistory from '$lib/pages/workflow-history.svelte';

  const workflow = $derived(page.params.workflow);
</script>

<PageTitle
  title={`${translate('workflows.workflow-history')} | ${workflow}`}
  url={page.url.href}
/>
<WorkflowHistoryLayout>
  {#snippet title()}
    <TimelineAndHistoryToggle />
  {/snippet}
  <WorkflowHistory />
</WorkflowHistoryLayout>
