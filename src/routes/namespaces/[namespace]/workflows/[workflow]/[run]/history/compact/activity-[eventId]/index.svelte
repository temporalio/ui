<script context="module" lang="ts">
  import { routeFor } from '$lib/utilities/route-for';
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async function ({ params }) {
    const { workflow: workflowId, run: runId, namespace, eventId } = params;

    return {
      status: 302,
      redirect: routeFor('workflow.events.compact.activity.event', {
        namespace,
        workflowId,
        runId,
        eventId,
        activityId: eventId,
      }),
    };
  };
</script>
