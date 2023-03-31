// Schedules
type StructuredCalendarSpec = import('$types').StructuredCalendarSpec;

type ScheduleParameters = ScheduleRequiredParameters &
  ScheduleSpecParameters &
  ScheduleUISpecParameters;

// Events

type PendingActivity = Replace<
  PendingActivityInfo,
  'activityId',
  {
    id: string;
    state: PendingActivityState;
    activityType?: { name: string };
  }
>;

type EventClassification =
  import('$lib/utilities/get-event-classiciation').EventClassification;

type ChildType = import('$lib/utilities/is-event-type').ChildType;

type FailActivityTaskRequest =
  import('$types').IRespondActivityTaskFailedByIdRequest;
type FailActivityTaskResponse =
  import('$types').IRespondActivityTaskFailedByIdResponse;
type CompleteActivityTaskRequest =
  import('$types').IRespondActivityTaskCompletedByIdRequest;
type CompleteActivityTaskResponse =
  import('$types').IRespondActivityTaskCompletedByIdResponse;

type EventAttributesWithType<K = EventAttributeKey> = HistoryEvent[K] & {
  type: K;
};

// Workflows

type WorkflowExecutionAPIResponse = Optional<
  DescribeWorkflowExecutionResponse,
  'executionConfig' | 'pendingActivities' | 'pendingChildren'
>;

type WorkflowIdentifier = IWorkflowExecution;
