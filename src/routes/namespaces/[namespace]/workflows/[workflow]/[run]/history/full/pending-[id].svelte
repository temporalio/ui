<script lang="ts">
  import { page } from '$app/stores';
  import EventDetails from '$lib/components/event-details.svelte';

  import type { WorkflowExecution } from '$lib/models/workflow-execution';
  import { getAppContext } from '$lib/utilities/get-context';

  const findActivity = async (
    workflow: PromiseLike<WorkflowExecution>,
    id: string,
  ): Promise<PendingActivity> => {
    return workflow.then(({ pendingActivities }) => {
      return pendingActivities.find((activity) => activity.activityId === id);
    });
  };

  let workflow = getAppContext('workflow');
  $: pendingActivity = findActivity($workflow, $page.params.id);
</script>

{#await pendingActivity then activity}
  <EventDetails attributes={activity} />
{/await}
