<script>
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import WorkflowRelationships from '$lib/components/workflow/workflow-relationships.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowPaddedLayout from '$lib/layouts/workflow-padded-layout.svelte';

  const workflow = $page.params.workflow;
</script>

<PageTitle
  title={`${translate('workflows.relationships')} | ${workflow}`}
  url={$page.url.href}
/>
<WorkflowPaddedLayout>
  <WorkflowRelationships />
</WorkflowPaddedLayout>
