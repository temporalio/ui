<script lang="ts">
  import { page } from '$app/stores';

  import { translate } from '$lib/i18n/translate';

  import WorkflowStackTrace from '$lib/pages/workflow-stack-trace.svelte';
  import PageTitle from '$lib/components/page-title.svelte';

  const workflow = $page.params.workflow;
</script>

<PageTitle
  title={`${translate('workflows', 'stack-trace-tab')} | ${workflow}`}
  url={$page.url.href}
/>
<WorkflowStackTrace />
