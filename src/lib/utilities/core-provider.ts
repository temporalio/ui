import { BROWSER } from 'esm-env';

import type { Settings } from '$lib/types/global';

export type RequestContext = {
  url: string;
  options: RequestInit;
};

export type PreRequestHook = (
  context: RequestContext,
) => Promise<RequestContext>;

export type PostResponseHook = (
  response: Response,
  context: RequestContext & { retry: () => Promise<Response> },
) => Promise<Response>;

export type WorkflowPermissionSettings = Partial<
  Pick<
    Settings,
    | 'disableWriteActions'
    | 'startWorkflowDisabled'
    | 'workflowCancelDisabled'
    | 'workflowSignalDisabled'
    | 'workflowUpdateDisabled'
    | 'workflowTerminateDisabled'
    | 'workflowResetDisabled'
    | 'workflowPauseDisabled'
  >
>;

export type NamespacePermissionCheck = (
  namespace: string,
  settings?: WorkflowPermissionSettings,
) => boolean;

export type CorePermissions = {
  namespaces: {
    canStartWorkflow: NamespacePermissionCheck;
    canRequestWorkflowCancellation: NamespacePermissionCheck;
    canSignalWorkflow: NamespacePermissionCheck;
    canUpdateWorkflow: NamespacePermissionCheck;
    canTerminateWorkflow: NamespacePermissionCheck;
    canResetWorkflow: NamespacePermissionCheck;
    canChangeWorkflowPauseState: NamespacePermissionCheck;
  };
};

export type CoreProvider = {
  getAccessToken: () => Promise<string>;
  getIdToken: () => Promise<string | undefined>;
  getRoutePrefix: () => string;
  api: {
    preRequest: PreRequestHook;
    postResponse: PostResponseHook;
  };
  getDataEncoderEndpoint: (namespace: string) => Promise<string>;
  searchNamespaces: (query: string) => Promise<string[]>;
  permissions: CorePermissions;
};

export type InitOptions = {
  getAccessToken: () => Promise<string>;
  getIdToken?: () => Promise<string | undefined>;
  getRoutePrefix?: () => string;
  api?: {
    preRequest?: PreRequestHook;
    postResponse?: PostResponseHook;
  };
  getDataEncoderEndpoint?: (namespace: string) => Promise<string>;
  searchNamespaces?: (query: string) => Promise<string[]>;
  permissions?: CorePermissions;
};

let provider: CoreProvider | undefined;

const passthrough: PreRequestHook = async (ctx) => ctx;
const passthroughResponse: PostResponseHook = async (res) => res;

const defaultPermissions: CorePermissions = {
  namespaces: {
    canStartWorkflow: (_namespace, settings) =>
      !settings?.disableWriteActions && !settings?.startWorkflowDisabled,
    canRequestWorkflowCancellation: (_namespace, settings) =>
      !settings?.disableWriteActions && !settings?.workflowCancelDisabled,
    canSignalWorkflow: (_namespace, settings) =>
      !settings?.disableWriteActions && !settings?.workflowSignalDisabled,
    canUpdateWorkflow: (_namespace, settings) =>
      !settings?.disableWriteActions && !settings?.workflowUpdateDisabled,
    canTerminateWorkflow: (_namespace, settings) =>
      !settings?.disableWriteActions && !settings?.workflowTerminateDisabled,
    canResetWorkflow: (_namespace, settings) =>
      !settings?.disableWriteActions && !settings?.workflowResetDisabled,
    canChangeWorkflowPauseState: (_namespace, settings) =>
      !settings?.disableWriteActions && !settings?.workflowPauseDisabled,
  },
};

export function initCoreProvider(options: InitOptions): void {
  provider = {
    getAccessToken: options.getAccessToken,
    getIdToken: options.getIdToken ?? (async () => undefined),
    getRoutePrefix: options.getRoutePrefix ?? (() => ''),
    api: {
      preRequest: options.api?.preRequest ?? passthrough,
      postResponse: options.api?.postResponse ?? passthroughResponse,
    },
    getDataEncoderEndpoint: options.getDataEncoderEndpoint ?? (async () => ''),
    searchNamespaces: options.searchNamespaces ?? (async () => []),
    permissions: options.permissions ?? defaultPermissions,
  };
}

function getCoreProvider(): CoreProvider {
  if (!provider) {
    throw new Error('Core provider has not been initialized');
  }
  return provider;
}

export const corePermissions: CorePermissions = {
  namespaces: {
    canStartWorkflow: (namespace, settings) =>
      getCoreProvider().permissions.namespaces.canStartWorkflow(
        namespace,
        settings,
      ),
    canRequestWorkflowCancellation: (namespace, settings) =>
      getCoreProvider().permissions.namespaces.canRequestWorkflowCancellation(
        namespace,
        settings,
      ),
    canSignalWorkflow: (namespace, settings) =>
      getCoreProvider().permissions.namespaces.canSignalWorkflow(
        namespace,
        settings,
      ),
    canUpdateWorkflow: (namespace, settings) =>
      getCoreProvider().permissions.namespaces.canUpdateWorkflow(
        namespace,
        settings,
      ),
    canTerminateWorkflow: (namespace, settings) =>
      getCoreProvider().permissions.namespaces.canTerminateWorkflow(
        namespace,
        settings,
      ),
    canResetWorkflow: (namespace, settings) =>
      getCoreProvider().permissions.namespaces.canResetWorkflow(
        namespace,
        settings,
      ),
    canChangeWorkflowPauseState: (namespace, settings) =>
      getCoreProvider().permissions.namespaces.canChangeWorkflowPauseState(
        namespace,
        settings,
      ),
  },
};

export async function getAccessToken(): Promise<string> {
  if (!BROWSER || !provider) return '';
  return provider.getAccessToken();
}

export async function getIdToken(): Promise<string | undefined> {
  if (!BROWSER || !provider) return undefined;
  return provider.getIdToken();
}

export function getRoutePrefix(): string {
  if (!BROWSER || !provider) return '';
  return provider.getRoutePrefix();
}

export async function getDataEncoderEndpoint(
  namespace: string,
): Promise<string> {
  if (!BROWSER || !provider) return '';
  return provider.getDataEncoderEndpoint(namespace);
}

export async function searchNamespaces(query: string): Promise<string[]> {
  if (!BROWSER || !provider) return [];
  return provider.searchNamespaces(query);
}

export async function runPreRequest(
  context: RequestContext,
): Promise<RequestContext> {
  if (!provider) return context;
  return provider.api.preRequest(context);
}

export async function runPostResponse(
  response: Response,
  context: RequestContext & { retry: () => Promise<Response> },
): Promise<Response> {
  if (!provider) return response;
  return provider.api.postResponse(response, context);
}
