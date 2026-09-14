<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowMetadata from '$lib/pages/workflow-metadata.svelte';

  const workflow = $derived(page.params.workflow);
</script>

<PageTitle
  title={`${translate('workflows.metadata-tab')} | ${workflow}`}
  url={page.url.href}
/>
<WorkflowMetadata />
