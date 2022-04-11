import { browser } from '$app/env';

export type EventView = 'full' | 'compact' | 'summary' | 'json';

let base = (import.meta.env?.VITE_API as string) ?? process.env.VITE_API;
base = `${base}/api/v1/`;

type RouteParameters = {
  namespace: string;
  workflow: string;
  run: string;
  view?: EventView;
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
export type EventParameters = Required<
  Pick<RouteParameters, 'namespace' | 'workflow' | 'run' | 'view' | 'eventId'>
>;

export type AuthenticationParameters = {
  settings: Settings;
  searchParams: URLSearchParams;
  originUrl?: string;
};

export const routeForNamespace = ({
  namespace,
}: NamespaceParameter): string => {
  return `/namespaces/${namespace}`;
};

export const routeForWorkflows = (parameters: NamespaceParameter): string => {
  return `${routeForNamespace(parameters)}/workflows`;
};

export const routeForArchivalWorkfows = (
  parameters: NamespaceParameter,
): string => {
  return `${routeForNamespace(parameters)}/archival`;
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
  const eventHistoryPath = `${routeForWorkflow(parameters)}/history`;

  switch (view) {
    case 'summary':
      return `${eventHistoryPath}/summary`;
    case 'full':
      return `${eventHistoryPath}/full`;
    case 'compact':
      return `${eventHistoryPath}/compact`;
    case 'json':
      return `${eventHistoryPath}/json`;
    default:
      return eventHistoryPath;
  }
};

export const routeForEventHistoryItem = (
  parameters: EventParameters,
): string => {
  return `${routeForEventHistory(parameters)}/${parameters.eventId}`;
};

export const routeForWorkers = (parameters: WorkflowParameters): string => {
  return `${routeForWorkflow(parameters)}/workers`;
};

export const routeForStackTrace = (parameters: WorkflowParameters): string => {
  return `${routeForWorkflow(parameters)}/stack-trace`;
};

export const routeForWorkflowQuery = (
  parameters: WorkflowParameters,
): string => {
  return `${routeForWorkflow(parameters)}/query`;
};

export const routeForPendingActivities = (
  parameters: WorkflowParameters,
): string => {
  return `${routeForWorkflow(parameters)}/pending-activities`;
};

export const routeForAuthentication = (
  parameters: AuthenticationParameters,
): string => {
  const { settings, searchParams: currentSearchParams, originUrl } = parameters;

  const login = new URL('/auth/sso', settings.baseUrl);
  let opts = settings.auth.options ?? [];

  opts = [...opts, 'returnUrl'];

  opts.forEach((option) => {
    const searchParam = currentSearchParams.get(option);
    if (searchParam) {
      login.searchParams.set(option, searchParam);
    }
  });

  if (!login.searchParams.get('returnUrl') && originUrl) {
    login.searchParams.set('returnUrl', originUrl);
  }

  return login.toString();
};

export const routeForLoginPage = () => {
  if (browser) {
    const login = new URL('login', window.location.origin);
    login.searchParams.set('returnUrl', window.location.href);
    return login.toString();
  }

  return '/login';
};

export type ImportParameters = {
  importType: string;
  eventId?: string;
};

export const routeForImport = ({
  importType,
  eventId,
}: ImportParameters): string => {
  if (eventId) return `/import/${importType}/${eventId}`;
  return `/import/${importType}`;
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
