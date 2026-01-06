<script lang="ts">
  import { page } from '$app/state';

  import { getActivityExecution } from '$lib/services/standalone-activities';

  const namespace = $derived(page.params.namespace);
  const activityId = $derived(page.params.activityId);
</script>

{#await getActivityExecution(namespace, activityId) then execution}
  <pre>{JSON.stringify(execution, undefined, 2)}</pre>
{/await}
