<script lang="ts">
  import { page } from '$app/stores';

  import WorkflowPendingActivities from '$lib/pages/workflow-pending-activities.svelte';
  import PageTitle from '$lib/holocene/page-title.svelte';
</script>

<PageTitle
  title={`Pending Activities | ${$page.params?.workflow}`}
  url={$page.url.href}
/>
<WorkflowPendingActivities />
