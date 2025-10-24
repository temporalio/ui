<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowCallStack from '$lib/pages/workflow-call-stack.svelte';

  const workflow = $page.params.workflow;
</script>

<PageTitle
  title={`${translate('workflows.call-stack-tab')} | ${workflow}`}
  url={$page.url.href}
/>
<WorkflowCallStack />
