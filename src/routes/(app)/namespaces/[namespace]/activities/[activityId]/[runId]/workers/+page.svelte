<script lang="ts">
  import { page } from '$app/state';

  import PageTitle from '$lib/components/page-title.svelte';
  import ActivityExecutionWorkers from '$lib/pages/standalone-activity-workers.svelte';

  const namespace = $derived(page.params.namespace);
  const activityId = $derived(page.params.activityId);
</script>

<PageTitle title="Activity Execution | {activityId}" url={page.url.href} />
<ActivityExecutionWorkers {namespace} />
