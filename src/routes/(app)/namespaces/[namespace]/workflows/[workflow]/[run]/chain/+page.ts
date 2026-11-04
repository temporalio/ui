import { error, redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

import { translate } from '$lib/i18n/translate';
import { fetchWorkflow } from '$lib/services/workflow-service';
import { routeForWorkflowChain } from '$lib/utilities/route-for';

export const load: PageLoad = async ({ params, fetch, parent }) => {
  await parent();

  const { namespace, workflow: workflowId, run: runId } = params;
  const { workflow, error: workflowError } = await fetchWorkflow(
    { namespace, workflowId, runId },
    fetch,
  );

  if (workflowError) {
    error(
      workflowError.statusCode,
      workflowError.message || workflowError.statusText,
    );
  }

  if (!workflow?.firstRunId) {
    error(502, translate('workflows.execution-chain-first-run-unavailable'));
  }

  redirect(
    302,
    routeForWorkflowChain({
      namespace,
      workflow: workflowId,
      firstRunId: workflow.firstRunId,
    }),
  );
};
