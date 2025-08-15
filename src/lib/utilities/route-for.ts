import { BROWSER } from 'esm-env';
import { InvalidTokenError, jwtDecode, type JwtPayload } from 'jwt-decode';
import lscache from 'lscache';

import { base } from '$app/paths';

import type { EventView } from '$lib/types/events';
import type { User } from '$lib/types/global';
import { OIDCFlow, type Settings } from '$lib/types/global';
import { encodeURIForSvelte } from '$lib/utilities/encode-uri';
import { toURL } from '$lib/utilities/to-url';

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
  query?: string;
  search?: string;
  page?: string;
};

export type NamespaceParameter = Pick<RouteParameters, 'namespace'>;
export type WorkflowsParameter = Pick<
  RouteParameters,
  'namespace' | 'query' | 'page'
>;
export type TaskQueueParameters = Pick<RouteParameters, 'namespace' | 'queue'>;
export type WorkflowParameters = Pick<
  RouteParameters,
  'namespace' | 'workflow' | 'run'
>;
export type ScheduleParameters = Pick<
  RouteParameters,
  'namespace' | 'scheduleId'
>;
export type EventHistoryParameters = Pick<
  RouteParameters,
  'namespace' | 'workflow' | 'run' | 'view' | 'queryParams'
>;
export type EventParameters = Pick<
  RouteParameters,
  'namespace' | 'workflow' | 'run' | 'view' | 'eventId'
>;

export type AuthenticationParameters = {
  settings: Settings;
  searchParams?: URLSearchParams;
  originUrl?: string;
};

export const routeForNamespaces = (): string => {
  return `${base}/namespaces`;
};

export const routeForNexus = (): string => {
  return `${base}/nexus`;
};

export const routeForNexusEndpoint = (id: string): string => {
  return `${base}/nexus/${id}`;
};

export const routeForNexusEndpointEdit = (id: string): string => {
  return `${base}/nexus/${id}/edit`;
};

export const routeForNexusEndpointCreate = (): string => {
  return `${base}/nexus/create`;
};

export const routeForNamespace = ({
  namespace,
}: NamespaceParameter): string => {
  return `${base}/namespaces/${namespace}`;
};

export const routeForNamespaceSelector = () => {
  return `${base}/select-namespace`;
};

export const routeForWorkflows = (parameters: NamespaceParameter): string => {
  return `${routeForNamespace(parameters)}/workflows`;
};

type StartWorkflowParameters = NamespaceParameter &
  Partial<{ workflowId: string; taskQueue: string; workflowType: string }>;
export const routeForWorkflowStart = ({
  namespace,
  workflowId,
  taskQueue,
  workflowType,
}: StartWorkflowParameters): string => {
  return toURL(`${routeForNamespace({ namespace })}/workflows/start-workflow`, {
    workflowId: workflowId || '',
    taskQueue: taskQueue || '',
    workflowType: workflowType || '',
  });
};

export const routeForWorkflowsWithQuery = ({
  namespace,
  query,
  page,
}: WorkflowsParameter): string | undefined => {
  if (!BROWSER) {
    return undefined;
  }

  return toURL(routeForWorkflows({ namespace }), {
    query,
    ...(page && { page }),
  });
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

export const routeForScheduleCreate = ({
  namespace,
}: NamespaceParameter): string => {
  return `${routeForSchedules({ namespace })}/create`;
};

export const routeForSchedule = ({
  scheduleId,
  namespace,
}: ScheduleParameters): string => {
  const sid = encodeURIForSvelte(scheduleId);

  return `${routeForSchedules({ namespace })}/${sid}`;
};

export const routeForScheduleEdit = ({
  scheduleId,
  namespace,
}: ScheduleParameters): string => {
  const sid = encodeURIForSvelte(scheduleId);

  return `${routeForSchedules({ namespace })}/${sid}/edit`;
};

export const routeForEventHistory = ({
  queryParams,
  ...parameters
}: EventHistoryParameters): string => {
  const eventHistoryPath = `${routeForWorkflow(parameters)}/history`;
  return toURL(`${eventHistoryPath}`, queryParams);
};

export const routeForEventHistoryEvent = ({
  eventId,
  ...parameters
}: EventParameters): string => {
  return `${routeForWorkflow(parameters)}/history/events/${eventId}`;
};

export const routeForEventGroup = ({
  eventId,
  ...parameters
}: EventParameters): string => {
  return `${routeForWorkflow(parameters)}/history/event-groups/${eventId}`;
};

export const routeForWorkers = (parameters: WorkflowParameters): string => {
  return `${routeForWorkflow(parameters)}/workers`;
};

export const routeForRelationships = (
  parameters: WorkflowParameters,
): string => {
  return `${routeForWorkflow(parameters)}/relationships`;
};

export const routeForTaskQueue = (parameters: TaskQueueParameters): string => {
  const queue = encodeURIForSvelte(parameters.queue);

  return `${routeForNamespace({
    namespace: parameters.namespace,
  })}/task-queues/${queue}`;
};

export const routeForCallStack = (parameters: WorkflowParameters): string => {
  return `${routeForWorkflow(parameters)}/call-stack`;
};

export const routeForWorkflowQuery = (
  parameters: WorkflowParameters,
): string => {
  return `${routeForWorkflow(parameters)}/query`;
};

export const routeForWorkflowMetadata = (
  parameters: WorkflowParameters,
): string => {
  return `${routeForWorkflow(parameters)}/metadata`;
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
  switch (settings.auth.flow) {
    case OIDCFlow.AuthorizationCode:
    default:
      return routeForAuthorizationCodeFlow(
        settings,
        currentSearchParams,
        originUrl,
      );
    case OIDCFlow.Implicit:
      return routeForImplicitFlow(settings, currentSearchParams, originUrl);
  }
};

const routeForAuthorizationCodeFlow = (
  settings: Settings,
  currentSearchParams: URLSearchParams,
  originUrl: string,
) => {
  const login = new URL(`${base}/auth/sso`, settings.baseUrl);
  let opts = settings.auth.options ?? [];

  opts = [...opts, 'returnUrl'];

  opts.forEach((option) => {
    if (!currentSearchParams) return;
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

/**
 *
 * @returns URL for the SSO redirect
 * @modifies adds items to browser localStorage
 *
 */
export const routeForImplicitFlow = (
  settings: Settings,
  currentSearchParams: URLSearchParams,
  originUrl: string,
): string => {
  const authorizationUrl = new URL(settings.auth.authorizationUrl);
  authorizationUrl.searchParams.set('response_type', 'id_token');
  authorizationUrl.searchParams.set('client_id', settings.auth.clientId);
  authorizationUrl.searchParams.set('redirect_uri', originUrl);
  authorizationUrl.searchParams.set('scope', settings.auth.scopes.join(' '));

  // FIXME: support concurrent requests with multiple TTL-ed nonces. but since we don't validate the nonce, it doesn't matter
  const nonce = crypto.randomUUID();
  window.localStorage.setItem('nonce', nonce);
  authorizationUrl.searchParams.set('nonce', nonce);

  // state stores a reference to the redirect path
  const state = crypto.randomUUID();
  const stateUrl =
    currentSearchParams.get('returnUrl') ?? window.location.href ?? '/';
  lscache.set(`oidc.${state}`, stateUrl, 10);
  authorizationUrl.searchParams.set('state', state);

  return authorizationUrl.toString();
};

export type OIDCCallback = {
  redirectUrl: string;
  authUser: User;
  stateKey: string;
};

export class OIDCImplicitCallbackError extends Error {}
export class OIDCImplicitCallbackNonceError extends OIDCImplicitCallbackError {}
export class OIDCImplicitCallbackStateError extends OIDCImplicitCallbackError {}

/**
 * takes a hash string attempts to parse it as a callback for the OIDC implicit flow
 *
 * @returns return URL from the SSO redirect and the user's auth data. null if hash is not for OIDC implicit flow
 * @throws {OIDCImplicitCallbackError} when an invalid id_token param is found
 * @throws {OIDCImplicitCallbackNonceError, OIDCImplicitCallbackStateError} when inconsistencies in the nonce or state fail security checks
 *
 */
export const maybeRouteForOIDCImplicitCallback = (
  rawHash: string,
): OIDCCallback | null => {
  const hash = new URLSearchParams(rawHash.substring(1));

  interface OIDCImplicitJwtPayload extends JwtPayload {
    nonce?: string;
    name?: string;
    email?: string;
  }

  const rawIdToken = hash.get('id_token');
  if (!rawIdToken) {
    return null;
  }

  const nonce = window.localStorage.getItem('nonce');
  if (!nonce) {
    throw new OIDCImplicitCallbackNonceError('No nonce in localStorage');
  }

  let token: OIDCImplicitJwtPayload;
  try {
    // validation is delegated to the cluster's ClaimMapper plugin
    token = jwtDecode<OIDCImplicitJwtPayload>(rawIdToken);
  } catch (e) {
    if (e instanceof InvalidTokenError) {
      throw new OIDCImplicitCallbackError('Invalid id_token in hash');
    } else {
      throw new OIDCImplicitCallbackError(e);
    }
  }

  // TODO: support optional issuer validation with settings.auth.issuerUrl and token.iss

  // README: this OIDC behavior is disabled because it's not supported by datadog Vault
  // if (!token.nonce) {
  //   throw new OIDCImplicitCallbackNonceError('No nonce in token');
  // } else if (token.nonce !== nonce) {
  //   throw new OIDCImplicitCallbackNonceError('Mismatched nonces');
  // }

  const stateKey = hash.get('state');
  if (!stateKey) {
    throw new OIDCImplicitCallbackStateError('No state in hash');
  }
  const redirectUrl = lscache.get(`oidc.${stateKey}`);
  if (!redirectUrl) {
    throw new OIDCImplicitCallbackStateError(
      'Hash state missing from localStorage',
    );
  }

  return {
    redirectUrl: redirectUrl,
    authUser: {
      idToken: rawIdToken,
      name: token.name,
      email: token.email,
    },
    stateKey: stateKey,
  };
};

export const routeForLoginPage = (error = '', isBrowser = BROWSER): string => {
  if (isBrowser) {
    const login = new URL(`${base}/login`, window.location.origin);
    login.searchParams.set('returnUrl', window.location.href);
    if (error) {
      login.searchParams.set('error', error);
    }
    return login.toString();
  }

  return `${base}/login`;
};

export const routeForEventHistoryImport = (
  namespace?: string,
  view?: EventView,
): string => {
  if (namespace && view) {
    return `${base}/import/events/${namespace}/workflow/run/history/${view}`;
  }
  return `${base}/import/events`;
};

export const routeForBatchOperations = ({
  namespace,
}: {
  namespace: string;
}) => {
  return `${base}/namespaces/${namespace}/batch-operations`;
};

export const routeForBatchOperation = ({
  namespace,
  jobId,
}: {
  namespace: string;
  jobId: string;
}) => {
  return `${base}/namespaces/${namespace}/batch-operations/${jobId}`;
};

export const hasParameters =
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
  'eventId',
);
