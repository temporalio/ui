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
  | 'events.ascending'
  | 'events.descending';

export type WorkflowSignalAPIRoutePath = 'workflow.signal';

export type WorkflowQueryAPIRoutePath = 'query';

export type WorkflowActivitiesAPIRoutePath =
  | 'activity.complete'
  | 'activity.fail';

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
export type WorkerAPIRoutePath = 'worker-task-reachability';
export type SchedulesAPIRoutePath = 'schedules';
export type ScheduleAPIRoutePath =
  | 'schedule'
  | 'schedule.patch'
  | 'schedule.edit';
export type SearchAttributesRoutePath = 'search-attributes';
export type NexusAPIRoutePath = 'nexus-endpoint' | 'nexus-endpoint.update';

export type APIRoutePath =
  | ParameterlessAPIRoutePath
  | ScheduleAPIRoutePath
  | SchedulesAPIRoutePath
  | SearchAttributesRoutePath
  | TaskQueueAPIRoutePath
  | WorkerAPIRoutePath
  | WorkflowAPIRoutePath
  | WorkflowSignalAPIRoutePath
  | WorkflowQueryAPIRoutePath
  | WorkflowActivitiesAPIRoutePath
  | WorkflowsAPIRoutePath
  | NamespaceAPIRoutePath
  | BatchAPIRoutePath
  | NexusAPIRoutePath;

export type APIRouteParameters = {
  namespace: string;
  workflowId: string;
  scheduleId: string;
  batchJobId: string;
  queue: string;
  queryType: string;
  signalName: string;
  activityId: string;
  endpointId: string;
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

export type WorkflowRouteParameters = Pick<
  APIRouteParameters,
  'namespace' | 'workflowId'
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

export type ValidWorkflowEndpoints = WorkflowsAPIRoutePath;

export type ValidWorkflowParameters =
  | ArchiveFilterParameters
  | FilterParameters;

export type ScheduleRouteParameters = Pick<
  APIRouteParameters,
  'namespace' | 'scheduleId'
>;

export type NexusRouteParameters = Pick<APIRouteParameters, 'endpointId'>;
