import { browser } from '$app/env';
import { toURL } from '$lib/utilities/to-url';
import { encodeURIForSvelte } from '$lib/utilities/encode-uri';

type RouteParameters = {
  namespace: string;
  workflow: string;
  run: string;
  view?: EventView | string;
  queryParams?: Record<string, string>;
  eventId: string;
  scheduleId: string;
  queue: string;
  schedule: string;
};

export const isEventView = (view: string): view is EventView => {
  if (view === 'feed') return true;
  if (view === 'compact') return true;
  if (view === 'json') return true;
  return false;
};

export type NamespaceParameter = Pick<RouteParameters, 'namespace'>;
export type WorkflowParameters = Pick<
  RouteParameters,
  'namespace' | 'workflow' | 'run'
>;
export type ScheduleParameters = Pick<
  RouteParameters,
  'namespace' | 'schedule' | 'run' | 'scheduleId'
>;
export type EventHistoryParameters = Pick<
  RouteParameters,
  'namespace' | 'workflow' | 'run' | 'view' | 'queryParams'
>;
export type EventParameters = Required<
  Pick<RouteParameters, 'namespace' | 'workflow' | 'run' | 'view' | 'eventId'>
>;

export type AuthenticationParameters = {
  settings: Settings;
  searchParams?: URLSearchParams;
  originUrl?: string;
};

export const routeForNamespaces = (): string => {
  return `/namespaces`;
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
  const wid = encodeURIForSvelte(workflow);

  return `${routeForWorkflows(parameters)}/${wid}/${run}`;
};

export const routeForSchedules = (parameters: NamespaceParameter): string => {
  return `${routeForNamespace(parameters)}/schedules`;
};

export const isRouteForSchedules = (
  pathname,
  parameters: NamespaceParameter,
) => {
  return pathname === routeForSchedules(parameters);
};

export const routeForScheduleCreate = ({
  namespace,
}: ScheduleParameters): string => {
  return `${routeForSchedules({ namespace })}/new`;
};

export const routeForSchedule = ({
  scheduleId,
  namespace,
}: ScheduleParameters): string => {
  const sid = encodeURIForSvelte(scheduleId);

  return `${routeForSchedules({ namespace })}/${sid}`;
};

export const routeForEventHistory = ({
  view,
  queryParams,
  ...parameters
}: EventHistoryParameters): string => {
  const eventHistoryPath = `${routeForWorkflow(parameters)}/history`;
  if (!view || !isEventView(view)) return `${eventHistoryPath}/feed`;
  return toURL(`${eventHistoryPath}/${view}`, queryParams);
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

export const routeForLoginPage = (): string => {
  if (browser) {
    const login = new URL('login', window.location.origin);
    login.searchParams.set('returnUrl', window.location.href);
    return login.toString();
  }

  return '/login';
};

type ImportParameters = {
  importType: 'events';
  view?: EventView;
};

export const routeForImport = ({
  importType,
  view,
}: ImportParameters): string => {
  if (importType === 'events' && view) {
    return `/import/${importType}/namespace/workflow/run/history/${view}`;
  }
  return `/import/${importType}`;
};

const hasParameters =
  <T extends Record<string, string | Record<string, string>>>(
    ...required: string[]
  ) =>
  (
    parameters: Record<string, string | Record<string, string>>,
  ): parameters is T => {
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
  'queryParams',
);

export const isEventParameters = hasParameters<EventParameters>(
  'namespace',
  'workflow',
  'run',
  'view',
  'eventId',
);
