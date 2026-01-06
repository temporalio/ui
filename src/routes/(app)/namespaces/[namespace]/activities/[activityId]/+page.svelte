<script lang="ts">
  import { page } from '$app/state';

  import ActivityExecutionDetails from '$lib/pages/activity-execution-details.svelte';

  const namespace = $derived(page.params.namespace);
  const activityId = $derived(page.params.activityId);
</script>

<ActivityExecutionDetails {namespace} {activityId} />
