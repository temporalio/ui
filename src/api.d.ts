type WorkflowsAPIRoutePath = 'workflows' | 'workflows.archived';

type WorkflowAPIRoutePath =
  | 'workflow'
  | 'workflow.terminate'
  | 'events'
  | 'query';

type TaskQueueAPIRoutePath = 'task-queue';
type ParameterlessAPIRoutePath = 'cluster' | 'settings' | 'user' | 'namespaces';

type APIRoutePath =
  | WorkflowsAPIRoutePath
  | WorkflowAPIRoutePath
  | ParameterlessAPIRoutePath
  | TaskQueueAPIRoutePath
  | WorkflowsAPIArchivalRoutePath;

type APIRouteParameters = {
  namespace: string;
  executionId: string;
  runId: string;
  queue: string;
};

type WorkflowListRouteParameters = Pick<APIRouteParameters, 'namespace'>;

type WorkflowRouteParameters = Pick<
  APIRouteParameters,
  'namespace' | 'executionId' | 'runId'
>;
type TaskQueueRouteParameters = Pick<APIRouteParameters, 'namespace' | 'queue'>;

type ValidWorkflowEndpoints =
  | WorkflowsAPIRoutePath
  | WorkflowsAPIArchivalRoutePath;

type ValidWorkflowParameters = ArchiveFilterParameters | FilterParameters;
