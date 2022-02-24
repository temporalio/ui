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

export type QueryParameters = { query?: URLSearchParams };
export type NamespaceParameter = { namespace: string } & QueryParameters;
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
  let route: string;

  if (path === 'workflows') {
    route = routeForWorkflows(parameters);
  }

  if (path === 'workflow') {
    route = routeForWorkflow(parameters);
  }

  if (path === 'workflow.events') {
    route = routeForEventHistory(parameters);
  }

  if (path === 'workflow.events.full') {
    route = routeForEventHistory(parameters, 'full');
  }

  if (path === 'workflow.events.compact') {
    route = routeForEventHistory(parameters, 'compact');
  }

  if (path === 'workflow.events.json') {
    route = routeForEventHistory(parameters, 'json');
  }

  if (path === 'workflow.events.full.event') {
    route = routeForEventHistoryItem(
      parameters,
      'full',
      'event',
      parameters.eventId,
    );
  }

  if (path === 'workflow.events.full.pending') {
    route = routeForEventHistoryItem(
      parameters,
      'full',
      'pending',
      parameters.eventId,
    );
  }

  if (path === 'workflow.events.compact.activity') {
    route = routeForEventHistoryItem(
      parameters,
      'compact',
      'activity',
      parameters.eventId,
    );
  }

  if (path === 'workflow.events.compact.activity.event') {
    route = routeForActivity(
      parameters,
      'compact',
      'activity',
      parameters.eventId,
      parameters.activityId,
    );
  }

  if (path === 'workflow.query') {
    route = routeForWorkflow(parameters) + '/query';
  }

  if (path === 'workflow.stack-trace') {
    route = routeForWorkflow(parameters) + '/stack-trace';
  }

  if (path === 'workers') {
    route = routeForWorkers(parameters);
  }

  if (parameters.query) {
    return `${route}?${parameters.query}`;
  } else {
    return route;
  }
}
