<script lang="ts">
  import { page } from '$app/state';

  import ActivityExecution from '$lib/pages/activity-execution-details.svelte';

  const namespace = $derived(page.params.namespace);
</script>

<ActivityExecution {namespace} />
