const apiHost = process.env.TEMPORAL_API_HOST || 'http://localhost:8088';

export async function get({ params }) {
  const { workflow: workflowId, run: runId } = params;

  const response = await fetch(
    `${apiHost}/api/namespaces/default/workflows/${workflowId}/${runId}`,
  );

  const workflow = await response.json();

  return {
    body: {
      ...workflow,
    },
  };
}
