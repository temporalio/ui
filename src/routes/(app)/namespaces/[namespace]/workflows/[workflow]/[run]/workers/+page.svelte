<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowWorkers from '$lib/pages/workflow-workers.svelte';

  const workflowId = $derived(page.params.workflow);
</script>

<PageTitle
  title={`${translate('workflows.workers-tab')} | ${workflowId}`}
  url={page.url.href}
/>
<WorkflowWorkers />
