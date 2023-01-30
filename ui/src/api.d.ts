type WorkflowsAPIRoutePath =
  | 'workflows'
  | 'workflows.archived'
  | 'workflows.count';

type WorkflowAPIRoutePath =
  | 'workflow'
  | 'workflow.terminate'
  | 'workflow.cancel'
  | 'workflow.signal'
  | 'events.ascending'
  | 'events.descending'
  | 'query';

type WorkflowActivitiesAPIRoutePath = 'activity.complete' | 'activity.fail';

type BatchAPIRoutePath =
  | 'batch-operations'
  | 'batch-operation.describe'
  // TODO: Remove when new batch APIs are deployed
  | 'workflows.batch.terminate'
  | 'workflows.batch.describe';

type NamespaceAPIRoutePath = 'namespace';

type TaskQueueAPIRoutePath = 'task-queue';
type ParameterlessAPIRoutePath = 'cluster' | 'settings' | 'user' | 'namespaces';
type SchedulesAPIRoutePath = 'schedules';
type ScheduleAPIRoutePath = 'schedule' | 'schedule.delete';
type SearchAttributesRoutePath = 'search-attributes';

type APIRoutePath =
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

type APIRouteParameters = {
  namespace: string;
  workflowId: string;
  scheduleId: string;
  runId: string;
  queue: string;
  scheduleId: string;
  activityId: string;
};

type WorkflowListRouteParameters = Pick<APIRouteParameters, 'namespace'>;
type NamespaceRouteParameters = Pick<APIRouteParameters, 'namespace'>;
type ScheduleListRouteParameters = Pick<APIRouteParameters, 'namespace'>;

type WorkflowRouteParameters = Pick<
  APIRouteParameters,
  'namespace' | 'workflowId' | 'runId'
>;

type WorkflowActivitiesRouteParameters = WorkflowRouteParameters &
  Pick<APIRouteParameters, 'activityId'>;

type BatchRouteParameters = Pick<APIRouteParameters, 'namespace'>;

type TaskQueueRouteParameters = Pick<APIRouteParameters, 'namespace' | 'queue'>;

type ValidWorkflowEndpoints = WorkflowsAPIRoutePath;

type ValidWorkflowParameters = ArchiveFilterParameters | FilterParameters;

type ScheduleRouteParameters = Pick<
  APIRouteParameters,
  'namespace' | 'scheduleId'
>;
