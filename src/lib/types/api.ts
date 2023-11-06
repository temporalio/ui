import type { ArchiveFilterParameters, FilterParameters } from './workflows';

export type WorkflowsAPIRoutePath =
  | 'workflows'
  | 'workflows.archived'
  | 'workflows.count';

export type WorkflowAPIRoutePath =
  | 'workflow'
  | 'workflow.terminate'
  | 'workflow.cancel'
  | 'workflow.signal'
  | 'workflow.reset'
  | 'events.ascending'
  | 'events.descending';

export type WorkflowQueryAPIRoutePath = 'query';

export type WorkflowActivitiesAPIRoutePath =
  | 'activity.complete'
  | 'activity.fail';

export type BatchAPIRoutePath = 'batch-operations.list' | 'batch-operations';

export type NamespaceAPIRoutePath = 'namespace';

export type TaskQueueAPIRoutePath = 'task-queue' | 'task-queue.compatibility';
export type ParameterlessAPIRoutePath =
  | 'systemInfo'
  | 'cluster'
  | 'settings'
  | 'user'
  | 'namespaces';
export type WorkerAPIRoutePath = 'worker-task-reachability';
export type SchedulesAPIRoutePath = 'schedules';
export type ScheduleAPIRoutePath = 'schedule' | 'schedule.delete';
export type SearchAttributesRoutePath = 'search-attributes';

export type APIRoutePath =
  | ParameterlessAPIRoutePath
  | ScheduleAPIRoutePath
  | SchedulesAPIRoutePath
  | SearchAttributesRoutePath
  | TaskQueueAPIRoutePath
  | WorkerAPIRoutePath
  | WorkflowAPIRoutePath
  | WorkflowQueryAPIRoutePath
  | WorkflowActivitiesAPIRoutePath
  | WorkflowsAPIRoutePath
  | NamespaceAPIRoutePath
  | BatchAPIRoutePath;

export type APIRouteParameters = {
  namespace: string;
  workflowId: string;
  scheduleId: string;
  batchJobId: string;
  queue: string;
  queryType: string;
  signalName: string;
  activityId: string;
};

export type WorkflowListRouteParameters = Pick<APIRouteParameters, 'namespace'>;
export type NamespaceRouteParameters = Pick<APIRouteParameters, 'namespace'>;
export type ScheduleListRouteParameters = Pick<APIRouteParameters, 'namespace'>;
export type SearchAttributesRouteParameters = Pick<
  APIRouteParameters,
  'namespace'
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
