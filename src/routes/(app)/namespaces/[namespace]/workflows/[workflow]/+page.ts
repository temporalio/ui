import { redirect, error } from '@sveltejs/kit';
import { fetchWorkflowForRunId } from '$lib/services/workflow-service';
import type { PageLoad } from './$types';

export const load: PageLoad = async function ({ url, params }) {
  const { namespace, workflow: workflowId } = params;
  const { runId } = await fetchWorkflowForRunId({ namespace, workflowId });

  if (runId) {
    throw redirect(302, `${url.pathname}/${runId}`);
  } else {
    throw error(404);
  }
};
