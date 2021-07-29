import type { Request, EndpointOutput } from '@sveltejs/kit';

const apiHost = process.env.TEMPORAL_API_HOST || 'http://localhost:8080';

export async function get({ params }: Request): Promise<EndpointOutput> {
  const { workflow: workflowId, run: runId } = params;

  const response = await fetch(
    `${apiHost}/api/v1/namespaces/default/workflows/${workflowId}/${runId}`,
  );

  const workflow = await response.json();

  return {
    body: {
      ...workflow,
    },
  };
}
