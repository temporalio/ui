type WorkflowsAPIRoutePath =
  | 'workflows'
  | 'workflows.archived'
  | 'workflows.count';

type WorkflowAPIRoutePath =
  | 'workflow'
  | 'workflow.terminate'
  | 'events.ascending'
  | 'events.descending'
  | 'query';

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
  | WorkflowsAPIRoutePath;

type APIRouteParameters = {
  namespace: string;
  workflowId: string;
  scheduleId: string;
  runId: string;
  queue: string;
  scheduleId: string;
};

type WorkflowListRouteParameters = Pick<APIRouteParameters, 'namespace'>;
type ScheduleListRouteParameters = Pick<APIRouteParameters, 'namespace'>;

type WorkflowRouteParameters = Pick<
  APIRouteParameters,
  'namespace' | 'workflowId' | 'runId'
>;

type TaskQueueRouteParameters = Pick<APIRouteParameters, 'namespace' | 'queue'>;

type ValidWorkflowEndpoints = WorkflowsAPIRoutePath;

type ValidWorkflowParameters = ArchiveFilterParameters | FilterParameters;

type ScheduleRouteParameters = Pick<
  APIRouteParameters,
  'namespace' | 'scheduleId'
>;
