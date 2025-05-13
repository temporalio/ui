<script>
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowHistoryEvent from '$lib/pages/workflow-history-event.svelte';

  const workflow = $page.params.workflow;
  const id = $page.params.id;
</script>

<PageTitle
  title={`${translate(
    'workflows.workflow-history',
  )} | ${workflow} | Event ${id}`}
  url={$page.url.href}
/>
<WorkflowHistoryEvent />
