type RoutePath =
  | 'workflows'
  | 'workflow'
  | 'workflow.events'
  | 'workers'
  | 'workflow.events.full'
  | 'workflow.events.full.event'
  | 'workflow.events.full.pending'
  | 'workflow.events.compact'
  | 'workflow.events.compact.activity'
  | 'workflow.events.compact.activity.event'
  | 'workflow.events.json'
  | 'workflow.stack-trace'
  | 'workflow.query'
  | 'workers';

type EventView = 'event' | 'pending' | 'activity';
type EventHistoryView = 'full' | 'compact' | 'json';

export type NamespaceParameter = { namespace: string };
export type WorkflowParameters = {
  workflowId: string;
  runId: string;
} & NamespaceParameter;
export type EventParameter = {
  eventId: string;
} & WorkflowParameters;
export type ActivityParameter = {
  activityId: string;
} & EventParameter;
export type TaskQueueParameter = {
  queue: string;
} & NamespaceParameter;

export type RouteParameters = NamespaceParameter &
  WorkflowParameters &
  EventParameter &
  ActivityParameter &
  TaskQueueParameter;

const routeForNamespace = ({ namespace }: NamespaceParameter): string => {
  return `/namespaces/${namespace}`;
};

const routeForWorkflows = (parameters: NamespaceParameter): string => {
  return `${routeForNamespace(parameters)}/workflows`;
};

const routeForWorkflow = ({
  workflowId,
  runId,
  ...parameters
}: WorkflowParameters): string => {
  return `${routeForWorkflows(parameters)}/${workflowId}/${runId}`;
};

const routeForEventHistory = (
  parameters: WorkflowParameters,
  view?: EventHistoryView,
): string => {
  if (!view) {
    return `${routeForWorkflow(parameters)}/history`;
  } else {
    return `${routeForWorkflow(parameters)}/history/${view}`;
  }
};

const routeForEventHistoryItem = (
  parameters: WorkflowParameters,
  view: EventHistoryView,
  eventType: EventView,
  id: string,
): string => {
  return `${routeForEventHistory(parameters, view)}/${eventType}-${id}`;
};

const routeForActivity = (
  parameters: WorkflowParameters,
  view: EventHistoryView,
  eventType: EventView,
  activityId: string,
  eventId: string,
): string => {
  return `${routeForEventHistory(
    parameters,
    view,
  )}/${eventType}-${eventId}/events/${activityId}`;
};

const routeForWorkers = (parameters: WorkflowParameters) => {
  return `${routeForWorkflow(parameters)}/workers`;
};

export function routeFor(
  path: 'workflows',
  parameters: NamespaceParameter,
): string;
export function routeFor(
  path:
    | 'workflow'
    | 'workflow.events'
    | 'workflow.events.full'
    | 'workflow.events.compact'
    | 'workflow.events.json'
    | 'workflow.stack-trace'
    | 'workflow.query'
    | 'workers',
  parameters: WorkflowParameters,
): string;
export function routeFor(
  path:
    | 'workflow.events.full.event'
    | 'workflow.events.full.pending'
    | 'workflow.events.compact.activity',
  parameters: EventParameter,
): string;
export function routeFor(
  path: 'workflow.events.compact.activity.event',
  parameters: ActivityParameter,
): string;
export function routeFor(
  path: 'workers',
  parameters: TaskQueueParameter,
): string;
export function routeFor(path: RoutePath, parameters: RouteParameters): string {
  if (path === 'workflows') {
    return routeForWorkflows(parameters);
  }

  if (path === 'workflow') {
    return routeForWorkflow(parameters);
  }

  if (path === 'workflow.events') {
    return routeForEventHistory(parameters);
  }

  if (path === 'workflow.events.full') {
    return routeForEventHistory(parameters, 'full');
  }

  if (path === 'workflow.events.compact') {
    return routeForEventHistory(parameters, 'compact');
  }

  if (path === 'workflow.events.json') {
    return routeForEventHistory(parameters, 'json');
  }

  if (path === 'workflow.events.full.event') {
    return routeForEventHistoryItem(
      parameters,
      'full',
      'event',
      parameters.eventId,
    );
  }

  if (path === 'workflow.events.full.pending') {
    return routeForEventHistoryItem(
      parameters,
      'full',
      'pending',
      parameters.eventId,
    );
  }

  if (path === 'workflow.events.compact.activity') {
    return routeForEventHistoryItem(
      parameters,
      'compact',
      'activity',
      parameters.eventId,
    );
  }

  if (path === 'workflow.events.compact.activity.event') {
    return routeForActivity(
      parameters,
      'compact',
      'activity',
      parameters.eventId,
      parameters.activityId,
    );
  }

  if (path === 'workflow.query') {
    return routeForWorkflow(parameters) + '/query';
  }

  if (path === 'workflow.stack-trace') {
    return routeForWorkflow(parameters) + '/stack-trace';
  }

  if (path === 'workers') {
    return routeForWorkers(parameters);
  }
}
