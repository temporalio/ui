<script>
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowUserMetadata from '$lib/pages/workflow-user-metadata.svelte';
</script>

<PageTitle
  title={`${translate('workflows.user-metadata-tab')} | ${page.params.workflow}`}
  url={page.url.href}
/>
<WorkflowUserMetadata />
