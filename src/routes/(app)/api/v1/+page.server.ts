import { UIServiceClient } from '$lib/buf/client';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';
import { ListWorkflowExecutionsRequest } from '@buf/temporal_frontend-api.bufbuild_es/temporal/api/workflowservice/v1/request_response_pb';

// 👇 since this is only called on the server, we can bypass HTTP 💡
export const load: PageServerLoad = async (event) => {
  const listWorkflowsRequest = new ListWorkflowExecutionsRequest({
    namespace: 'canary',
  });
  return {
    workflowsBuf: UIServiceClient.listWorkflowExecutions(listWorkflowsRequest),
    // workflowsTrpc: router
    //   .createCaller(await createContext(event))
    //   .getWorkflows(),
  };
};
