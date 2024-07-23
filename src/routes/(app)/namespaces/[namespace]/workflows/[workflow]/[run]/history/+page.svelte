<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowHistoryLayoutV2 from '$lib/layouts/workflow-history-layout-v2.svelte';
  const workflow = $page.params.workflow;
</script>

<PageTitle
  title={`${translate('workflows.workflow-history')} | ${workflow}`}
  url={$page.url.href}
/>
<WorkflowHistoryLayoutV2 />
