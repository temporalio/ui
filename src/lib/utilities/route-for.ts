type RoutePath =
  | 'workflows'
  | 'workflow'
  | 'workflow.events'
  | 'workers'
  | 'workflow.events.summary'
  | 'workflow.events.summary.event'
  | 'workflow.events.json'
  | 'workflow.stack-trace'
  | 'workflow.query'
  | 'workers';

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
  view?: 'full' | 'json',
): string => {
  if (!view) return `${routeForWorkflow(parameters)}/history`;
  if (view === 'full') return `${routeForWorkflow(parameters)}/history/summary`;
  if (view === 'json') return `${routeForWorkflow(parameters)}/history/json`;
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
    | 'workflow.events.summary'
    | 'workflow.events.json'
    | 'workflow.stack-trace'
    | 'workflow.query'
    | 'workers',
  parameters: WorkflowParameters,
): string;
export function routeFor(
  path: 'workflow.events.summary.event',
  parameters: EventParameter,
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

  if (path === 'workflow.events.summary') {
    route = routeForEventHistory(parameters, 'full');
  }

  if (path === 'workflow.events.json') {
    route = routeForEventHistory(parameters, 'json');
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
