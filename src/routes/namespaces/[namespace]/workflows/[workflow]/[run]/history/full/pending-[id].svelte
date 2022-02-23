<script lang="ts" context="module">
  import type { LoadInput } from '@sveltejs/kit';
  import type { WorkflowExecution } from '$lib/models/workflow-execution';

  export const load = async ({ stuff }: LoadInput) => {
    const { workflow, events } = stuff;

    return {
      props: { workflow, events },
    };
  };
</script>

<script lang="ts">
  import { page } from '$app/stores';
  import EventDetails from '$lib/components/event-details.svelte';

  const findActivity = (
    workflow: WorkflowExecution,
    id: string,
  ): PendingActivity => {
    return workflow.pendingActivities.find((activity) => activity.id === id);
  };

  export let workflow: WorkflowExecution;
  const pendingActivity = findActivity(workflow, $page.params.id);
</script>

{#await pendingActivity then activity}
  <EventDetails attributes={activity} />
{/await}
