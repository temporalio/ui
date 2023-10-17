<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowHistoryLayout from '$lib/layouts/workflow-history-layout.svelte';
  import WorkflowHistoryCompact from '$lib/pages/workflow-history-compact.svelte';
  import WorkflowHistoryFeed from '$lib/pages/workflow-history-feed.svelte';
  import WorkflowHistoryJson from '$lib/pages/workflow-history-json.svelte';
  import { eventViewType } from '$lib/stores/event-view';
  const workflow = $page.params.workflow;

  const views = {
    feed: WorkflowHistoryFeed,
    compact: WorkflowHistoryCompact,
    json: WorkflowHistoryJson,
  };
  $: view = views[$eventViewType] ?? WorkflowHistoryFeed;
</script>

<PageTitle
  title={`${translate('workflows.workflow-history')} | ${workflow}`}
  url={$page.url.href}
/>
<WorkflowHistoryLayout>
  <svelte:component this={view} />
</WorkflowHistoryLayout>
