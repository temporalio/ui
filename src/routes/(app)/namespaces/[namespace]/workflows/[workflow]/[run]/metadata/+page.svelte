<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowMetadata from '$lib/pages/workflow-metadata.svelte';

  const workflow = $page.params.workflow;
</script>

<PageTitle
  title={`${translate('workflows.metadata-tab')} | ${workflow}`}
  url={$page.url.href}
/>
<WorkflowMetadata />
