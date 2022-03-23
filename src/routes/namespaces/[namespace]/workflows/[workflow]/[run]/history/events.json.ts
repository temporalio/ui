import { fetchEvents } from '$lib/services/events-service';

export async function post({ request, params }) {
  const { workflow } = await request.json();
  const { namespace } = params;

  const parameters = {
    namespace,
    executionId: workflow.id,
    runId: workflow.runId,
  };

  const { events, eventGroups } = await fetchEvents(parameters, fetch);

  return {
    body: {
      namespace,
      workflow,
      events,
      eventGroups,
    },
  };
};
