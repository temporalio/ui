<script>
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import WorkflowRelationships from '$lib/components/workflow/workflow-relationships.svelte';
  import { translate } from '$lib/i18n/translate';

  const workflow = $derived(page.params.workflow);
</script>

<PageTitle
  title={`${translate('workflows.relationships')} | ${workflow}`}
  url={page.url.href}
/>
<WorkflowRelationships />
