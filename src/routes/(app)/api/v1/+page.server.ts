import { UIServiceClient } from '$lib/buf/client';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { PageServerLoad } from './$types';
import { ListNamespacesRequest } from '@buf/temporal_frontend-api.bufbuild_connect-es/temporal/api/workflowservice/v1/request_response_pb';

// 👇 since this is only called on the server, we can bypass HTTP 💡
export const load: PageServerLoad = async (event) => {
  const deleteNamespaceReq = new ListNamespacesRequest();
  deleteNamespaceReq.namespace = 'canary';
  return {
    workflowsBuf: UIServiceClient.listNamespaces(deleteNamespaceReq),
    workflowsTrpc: router
      .createCaller(await createContext(event))
      .getWorkflows(),
  };
};
