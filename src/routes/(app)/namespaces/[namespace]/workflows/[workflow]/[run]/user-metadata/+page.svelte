<script>
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import WorkflowUserMetadata from '$lib/components/workflow/metadata/workflow-user-metadata.svelte';
  import { translate } from '$lib/i18n/translate';
</script>

<PageTitle
  title={`${translate('workflows.user-metadata-tab')} | ${page.params.workflow}`}
  url={page.url.href}
/>
<WorkflowUserMetadata />
