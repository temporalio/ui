<script lang="ts">
  import { getContext } from 'svelte';
  import { page } from '$app/stores';
  import EventDetails from '$lib/components/event-details.svelte';

  import type { Refreshable } from '$lib/stores/refreshable';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  const findActivity = async (
    workflow: PromiseLike<WorkflowExecution>,
    id: string,
  ): Promise<PendingActivity> => {
    return workflow.then(({ pendingActivities }) => {
      return pendingActivities.find((activity) => activity.activityId === id);
    });
  };

  let workflow = getContext<Refreshable<WorkflowExecution>>('workflow');
  $: pendingActivity = findActivity($workflow, $page.params.id);
</script>

{#await pendingActivity then activity}
  <EventDetails attributes={activity} />
{/await}
