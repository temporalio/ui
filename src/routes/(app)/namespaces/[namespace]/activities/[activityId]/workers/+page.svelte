<script lang="ts">
  import { page } from '$app/state';

  import ActivityExecutionWorkers from '$lib/pages/activity-execution-workers.svelte';

  const namespace = $derived(page.params.namespace);
</script>

<ActivityExecutionWorkers {namespace} />
