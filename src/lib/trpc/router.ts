import type { Context } from '$lib/trpc/context';
import { initTRPC } from '@trpc/server';
import { WorkflowClient } from '@temporalio/client';
import { toWorkflowExecutions } from '$lib/models/workflow-execution';

export const t = initTRPC.context<Context>().create();

const temporalClient = new WorkflowClient();

export const router = t.router({
  getClusterInfo: t.procedure.query(async ({ ctx }) => {
    const clusterInfo = await temporalClient.workflowService.getClusterInfo({});
    return clusterInfo.toJSON();
  }),
  getWorkflows: t.procedure.query(async ({ ctx }) => {
    const response =
      await temporalClient.workflowService.listWorkflowExecutions({
        namespace: ctx?.params?.namespace ?? 'canary',
      });
    const { executions, nextPageToken } = response.toJSON();
    return {
      workflows: toWorkflowExecutions({ executions }),
      nextPageToken: String(nextPageToken),
    };
  }),
});
