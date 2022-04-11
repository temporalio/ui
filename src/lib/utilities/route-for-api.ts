import urlcat, { ParamMap } from 'urlcat';

let base = (import.meta.env?.VITE_API as string) ?? process.env.VITE_API;
base = `${base}/api/v1/`;

// We're using this type to force EXACT type matches so we don't get extraneous query params in our urls
type ValidateShape<T, Struct> = T extends Struct
  ? Exclude<keyof T, keyof Struct> extends never
    ? T
    : never
  : never;

export const ApiRoutes: Record<string, (params: ParamMap & never) => string> = {
  cluster(): string {
    return urlcat(base, '/cluster', {});
  },
  settings(): string {
    return urlcat(base, '/settings', {});
  },
  user(): string {
    return urlcat(base, '/me', {});
  },
  namespaces(): string {
    return urlcat(base, '/namespaces', {});
  },
  'task-queue'<T>(params: ValidateShape<T, TaskQueueRouteParameters>): string {
    return urlcat(base, `/namespaces/:namespace/task-queues/:queue`, params);
  },
  workflows<T>(params: ValidateShape<T, WorkflowListRouteParameters>): string {
    return urlcat(base, `/namespaces/:namespace/workflows`, params);
  },
  'workflows.archived'<T>(
    params: ValidateShape<T, WorkflowListRouteParameters>,
  ): string {
    return urlcat(base, `/namespaces/:namespace/workflows/archived`, params);
  },
  workflow<T>(params: ValidateShape<T, WorkflowRouteParameters>): string {
    return urlcat(
      base,
      `/namespaces/:namespace/workflows/:workflowId/runs/:runId`,
      params,
    );
  },
  'workflow.terminate'<T>(
    params: ValidateShape<T, WorkflowRouteParameters>,
  ): string {
    return urlcat(
      base,
      `/namespaces/:namespace/workflows/:workflowId/runs/:runId/terminate`,
      params,
    );
  },
  events<T>(params: ValidateShape<T, WorkflowRouteParameters>): string {
    return urlcat(
      base,
      `/namespaces/:namespace/workflows/:workflowId/runs/:runId/events`,
      params,
    );
  },
  query<T>(params: ValidateShape<T, WorkflowRouteParameters>): string {
    return urlcat(
      base,
      `/namespaces/:namespace/workflows/:workflowId/runs/:runId/query`,
      params,
    );
  },
};
