<script>
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowHistoryEvent from '$lib/pages/workflow-history-event.svelte';

  const workflow = $derived(page.params.workflow);
  const eventId = $derived(page.params.eventId);
</script>

<PageTitle
  title={`${translate(
    'workflows.workflow-history',
  )} | ${workflow} | Event ${eventId}`}
  url={page.url.href}
/>
<WorkflowHistoryEvent />
