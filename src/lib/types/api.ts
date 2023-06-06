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
  | 'events.descending'
  | 'query';

export type WorkflowActivitiesAPIRoutePath =
  | 'activity.complete'
  | 'activity.fail';

export type BatchAPIRoutePath = 'batch-operations' | 'batch-operation.describe';

export type NamespaceAPIRoutePath = 'namespace';

export type TaskQueueAPIRoutePath = 'task-queue';
export type ParameterlessAPIRoutePath =
  | 'cluster'
  | 'settings'
  | 'user'
  | 'namespaces';
export type SchedulesAPIRoutePath = 'schedules';
export type ScheduleAPIRoutePath = 'schedule' | 'schedule.delete';
export type SearchAttributesRoutePath = 'search-attributes';

export type APIRoutePath =
  | ParameterlessAPIRoutePath
  | ScheduleAPIRoutePath
  | SchedulesAPIRoutePath
  | SearchAttributesRoutePath
  | TaskQueueAPIRoutePath
  | WorkflowAPIRoutePath
  | WorkflowActivitiesAPIRoutePath
  | WorkflowsAPIRoutePath
  | NamespaceAPIRoutePath
  | BatchAPIRoutePath;

export type APIRouteParameters = {
  namespace: string;
  workflowId: string;
  scheduleId: string;
  runId: string;
  queue: string;
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
  'namespace' | 'workflowId' | 'runId'
>;

export type WorkflowActivitiesRouteParameters = WorkflowRouteParameters &
  Pick<APIRouteParameters, 'activityId'>;

export type BatchRouteParameters = Pick<APIRouteParameters, 'namespace'>;

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
