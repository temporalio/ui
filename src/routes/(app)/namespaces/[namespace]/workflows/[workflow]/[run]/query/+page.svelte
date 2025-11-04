<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowQuery from '$lib/pages/workflow-query.svelte';

  const workflow = $page.params.workflow;
</script>

<PageTitle
  title={`${translate('workflows.queries-tab')} | ${workflow}`}
  url={$page.url.href}
/>
<WorkflowQuery />
