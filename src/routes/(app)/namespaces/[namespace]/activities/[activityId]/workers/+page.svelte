<script lang="ts">
  import { page } from '$app/state';

  import ActivityExecutionWorkers from '$lib/pages/activity-execution-workers.svelte';
  import { getPollers } from '$lib/services/pollers-service';
  import { activityExecution } from '$lib/utilities/activity-execution-poller.svelte';

  const namespace = $derived(page.params.namespace);
  const searchAttributes = $derived($activityExecution.info.searchAttributes);
</script>

{#await getPollers( { queue: $activityExecution.info.taskQueue, namespace }, ) then workers}
  <ActivityExecutionWorkers {workers} {searchAttributes} />
{/await}
