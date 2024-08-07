<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import LabsModeGuard from '$lib/holocene/labs-mode-guard.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowHistoryLayoutV2 from '$lib/layouts/workflow-history-layout-v2.svelte';
  import WorkflowHistoryLayout from '$lib/layouts/workflow-history-layout.svelte';
  import WorkflowHistoryCompact from '$lib/pages/workflow-history-compact.svelte';
  import WorkflowHistoryFeed from '$lib/pages/workflow-history-feed.svelte';
  import WorkflowHistoryJson from '$lib/pages/workflow-history-json.svelte';
  import { eventViewType } from '$lib/stores/event-view';
  const workflow = $page.params.workflow;

  export let data;

  let content = data.content || '';

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

<LabsModeGuard>
  <WorkflowHistoryLayoutV2 {content} />
  <WorkflowHistoryLayout slot="fallback">
    <svelte:component this={view} />
  </WorkflowHistoryLayout>
</LabsModeGuard>
