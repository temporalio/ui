<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowHistoryLayout from '$lib/layouts/workflow-history-layout.svelte';

  const workflow = $derived(page.params.workflow);
</script>

<PageTitle
  title={`${translate('workflows.workflow-history')} | ${workflow}`}
  url={page.url.href}
/>
<WorkflowHistoryLayout />
