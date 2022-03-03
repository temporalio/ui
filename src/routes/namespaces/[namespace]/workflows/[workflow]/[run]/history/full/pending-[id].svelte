<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ stuff }) {
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
