import type { ArchiveFilterParameters, FilterParameters } from './workflows';

export type WorkflowsAPIRoutePath =
  | 'workflows'
  | 'workflows.archived'
  | 'workflows.count';

export type WorkflowAPIRoutePath =
  | 'workflow'
  | 'workflow.terminate'
  | 'workflow.cancel'
  | 'workflow.reset'
  | 'events.raw'
  | 'events.ascending'
  | 'events.descending';

export type WorkflowSignalAPIRoutePath = 'workflow.signal';

export type WorkflowUpdateAPIRoutePath = 'workflow.update';

export type WorkflowQueryAPIRoutePath = 'query';

export type WorkflowActivitiesAPIRoutePath =
  | 'activity.complete'
  | 'activity.fail'
  | 'activity.pause'
  | 'activity.unpause'
  | 'activity.reset'
  | 'activity.update-options';

export type BatchAPIRoutePath = 'batch-operations.list' | 'batch-operations';

export type NamespaceAPIRoutePath = 'namespace';

export type TaskQueueAPIRoutePath =
  | 'task-queue'
  | 'task-queue.compatibility'
  | 'task-queue.rules';
export type ParameterlessAPIRoutePath =
  | 'systemInfo'
  | 'cluster'
  | 'settings'
  | 'user'
  | 'nexus-endpoints'
  | 'namespaces';
export type WorkerAPIRoutePath =
  | 'worker-task-reachability'
  | 'workers'
  | 'worker';
export type SchedulesAPIRoutePath = 'schedules';
export type ScheduleAPIRoutePath =
  | 'schedule'
  | 'schedule.patch'
  | 'schedule.edit';
export type SearchAttributesRoutePath = 'search-attributes';
export type NexusAPIRoutePath = 'nexus-endpoint' | 'nexus-endpoint.update';
export type WorkerDeploymentsAPIRoutePath = 'worker-deployments';
export type WorkerDeploymentAPIRoutePath = 'worker-deployment';
export type WorkerDeploymentVersionAPIRoutePath = 'worker-deployment-version';

export type APIRoutePath =
  | ParameterlessAPIRoutePath
  | ScheduleAPIRoutePath
  | SchedulesAPIRoutePath
  | SearchAttributesRoutePath
  | TaskQueueAPIRoutePath
  | WorkerAPIRoutePath
  | WorkflowAPIRoutePath
  | WorkflowSignalAPIRoutePath
  | WorkflowUpdateAPIRoutePath
  | WorkflowQueryAPIRoutePath
  | WorkflowActivitiesAPIRoutePath
  | WorkflowsAPIRoutePath
  | NamespaceAPIRoutePath
  | BatchAPIRoutePath
  | NexusAPIRoutePath
  | WorkerDeploymentsAPIRoutePath
  | WorkerDeploymentAPIRoutePath
  | WorkerDeploymentVersionAPIRoutePath;

export type APIRouteParameters = {
  namespace: string;
  workflowId: string;
  scheduleId: string;
  // feel like this might not be the "right" spot for this.
  runId: string;
  batchJobId: string;
  queue: string;
  queryType: string;
  signalName: string;
  updateName: string;
  activityId: string;
  endpointId: string;
  deploymentName: string;
  version: string;
  workerInstanceKey: string;
};

export type WorkflowListRouteParameters = Pick<APIRouteParameters, 'namespace'>;
export type NamespaceRouteParameters = Pick<APIRouteParameters, 'namespace'>;
export type ScheduleListRouteParameters = Pick<APIRouteParameters, 'namespace'>;
export type SearchAttributesRouteParameters = Pick<
  APIRouteParameters,
  'namespace'
>;

export type WorkflowSignalRouteParameters = Pick<
  APIRouteParameters,
  'namespace' | 'workflowId' | 'signalName'
>;

export type WorkflowUpdateRouteParameters = Pick<
  APIRouteParameters,
  'namespace' | 'workflowId' | 'updateName'
>;

export type WorkflowRouteParameters = Pick<
  APIRouteParameters,
  'namespace' | 'workflowId'
>;

export type WorkflowRawHistoryRouteParameters = Pick<
  APIRouteParameters,
  'namespace' | 'workflowId' | 'runId'
>;

export type WorkflowQueryRouteParameters = Pick<
  APIRouteParameters,
  'namespace' | 'workflowId' | 'queryType'
>;

export type WorkflowActivitiesRouteParameters = Pick<
  APIRouteParameters,
  'namespace'
>;

export type BatchRouteParameters = Pick<
  APIRouteParameters,
  'namespace' | 'batchJobId'
>;

export type TaskQueueRouteParameters = Pick<
  APIRouteParameters,
  'namespace' | 'queue'
>;

export type WorkerRouteParameters = Pick<
  APIRouteParameters,
  'namespace' | 'queue' | 'workerInstanceKey'
>;

export type ValidWorkflowEndpoints = WorkflowsAPIRoutePath;

export type ValidWorkflowParameters =
  | ArchiveFilterParameters
  | FilterParameters;

export type ScheduleRouteParameters = Pick<
  APIRouteParameters,
  'namespace' | 'scheduleId'
>;

export type NexusRouteParameters = Pick<APIRouteParameters, 'endpointId'>;

export type WorkerDeploymentListRouteParameters = Pick<
  APIRouteParameters,
  'namespace'
>;
export type WorkerDeploymentRouteParameters = Pick<
  APIRouteParameters,
  'namespace' | 'deploymentName'
>;

export type WorkerDeploymentVersionRouteParameters = Pick<
  APIRouteParameters,
  'namespace' | 'version'
>;
