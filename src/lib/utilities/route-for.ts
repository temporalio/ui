export type EventView = 'compact' | 'summary' | 'json';

type RouteParameters = {
  namespace: string;
  workflow: string;
  run: string;
  view: EventView;
  eventId: string;
  queue: string;
};

export const isEventView = (view: string): view is EventView => {
  if (view === 'summary') return true;
  if (view === 'compact') return true;
  if (view === 'json') return true;
  return false;
};

export type NamespaceParameter = Pick<RouteParameters, 'namespace'>;
export type WorkflowParameters = Pick<
  RouteParameters,
  'namespace' | 'workflow' | 'run'
>;
export type EventHistoryParameters = Pick<
  RouteParameters,
  'namespace' | 'workflow' | 'run' | 'view'
>;
export type EventParameters = Pick<
  RouteParameters,
  'namespace' | 'workflow' | 'run' | 'view' | 'eventId'
>;

export const routeForNamespace = ({
  namespace,
}: NamespaceParameter): string => {
  return `/namespaces/${namespace}`;
};

export const routeForWorkflows = (parameters: NamespaceParameter): string => {
  return `${routeForNamespace(parameters)}/workflows`;
};

export const routeForWorkflow = ({
  workflow,
  run,
  ...parameters
}: WorkflowParameters): string => {
  return `${routeForWorkflows(parameters)}/${workflow}/${run}`;
};

export const routeForEventHistory = ({
  view,
  ...parameters
}: EventHistoryParameters): string => {
  if (view === 'summary')
    return `${routeForWorkflow(parameters)}/history/summary`;
  if (view === 'compact')
    return `${routeForWorkflow(parameters)}/history/compact`;
  if (view === 'json') return `${routeForWorkflow(parameters)}/history/json`;
};

export const routeForEventHistoryItem = (
  parameters: EventParameters,
): string => {
  return `${routeForEventHistory(parameters)}/${parameters.eventId}`;
};

export const routeForWorkers = (parameters: WorkflowParameters) => {
  return `${routeForWorkflow(parameters)}/workers`;
};

export const routeForStackTrace = (parameters: WorkflowParameters) => {
  return `${routeForWorkflow(parameters)}/stack-trace`;
};

export const routeForWorkflowQuery = (parameters: WorkflowParameters) => {
  return `${routeForWorkflow(parameters)}/query`;
};

const hasParameters =
  <T extends Record<string, string>>(...required: string[]) =>
  (parameters: Record<string, string>): parameters is T => {
    for (const parameter of required) {
      if (!parameters[parameter]) return false;
    }
    return true;
  };

export const isNamespaceParameter =
  hasParameters<NamespaceParameter>('namespace');

export const isWorkflowParameters = hasParameters<WorkflowParameters>(
  'namespace',
  'workflow',
  'run',
);

export const isEventHistoryParameters = hasParameters<EventHistoryParameters>(
  'namespace',
  'workflow',
  'run',
  'view',
);

export const isEventParameters = hasParameters<EventParameters>(
  'namespace',
  'workflow',
  'run',
  'view',
  'eventId',
);
