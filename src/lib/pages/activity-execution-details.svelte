<script lang="ts">
  import { getActivityExecution } from '$lib/services/standalone-activities';

  interface Props {
    namespace: string;
    activityId: string;
  }

  let { namespace, activityId }: Props = $props();
</script>

{#await getActivityExecution(namespace, activityId) then execution}
  <pre>{JSON.stringify(execution, undefined, 2)}</pre>
{/await}
