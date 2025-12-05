<script lang="ts">
  import { page } from '$app/stores';

  import PageTitle from '$lib/components/page-title.svelte';
  import { translate } from '$lib/i18n/translate';
  import WorkflowPendingActivities from '$lib/pages/workflow-pending-activities.svelte';

  const workflow = $page.params.workflow;
</script>

<PageTitle
  title={`${translate('workflows.pending-activities-tab')} | ${workflow}`}
  url={$page.url.href}
/>
<WorkflowPendingActivities />
