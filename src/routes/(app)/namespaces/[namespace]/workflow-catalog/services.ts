import { page } from '$app/state';

import {
  createWorkflowCatalogSessionStore,
  type WorkflowCatalogSessionStore,
} from '$lib/workflow-catalog/browser/session-store';
import {
  type WorkbenchHost,
  workflowCatalogStartAllowed,
} from '$lib/workflow-catalog/browser/workbench-host';
import { createOssUiWorkbenchHost } from '$lib/workflow-catalog/oss/ui-services';

import { resolveWorkflowCatalogForNamespace } from './catalog';

export type WorkflowCatalogServices = {
  host: WorkbenchHost;
  sessionStore: WorkflowCatalogSessionStore;
};

export type WorkflowCatalogServiceOptions = {
  namespace: string;
  namespaceWriteDisabled: (namespace: string) => boolean;
  getIdentity?: () => string | undefined;
};

const workflowStartsDisabled = () =>
  (page.data?.settings as { startWorkflowDisabled?: boolean } | undefined)
    ?.startWorkflowDisabled ?? false;

const createWorkflowCatalogServices = ({
  namespace,
  namespaceWriteDisabled,
  getIdentity,
}: WorkflowCatalogServiceOptions): WorkflowCatalogServices => {
  const host = createOssUiWorkbenchHost({
    descriptors: resolveWorkflowCatalogForNamespace(namespace),
    getIdentity,
  });
  const sessionStore = createWorkflowCatalogSessionStore(host, {
    startAllowed: (descriptor) =>
      workflowCatalogStartAllowed(descriptor, {
        disableWriteActions: page.data?.settings?.disableWriteActions ?? false,
        workflowStartsDisabled: workflowStartsDisabled(),
        namespaceWriteDisabled,
      }),
  });

  return { host, sessionStore };
};

const servicesByNamespace = new Map<string, WorkflowCatalogServices>();

export const getWorkflowCatalogServices = (
  options: WorkflowCatalogServiceOptions,
): WorkflowCatalogServices => {
  const existing = servicesByNamespace.get(options.namespace);
  if (existing) return existing;

  const services = createWorkflowCatalogServices(options);
  servicesByNamespace.set(options.namespace, services);

  return services;
};
