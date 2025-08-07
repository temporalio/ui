<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowPaddedLayout from '$lib/layouts/workflow-padded-layout.svelte';
  import WorkflowSearchAttributes from '$lib/pages/workflow-search-attributes.svelte';
</script>

<PageTitle
  title={`${translate('workflows.search-attributes-tab')} | ${page.params.workflow}`}
  url={page.url.href}
/>
<WorkflowPaddedLayout>
  <WorkflowSearchAttributes />
</WorkflowPaddedLayout>
