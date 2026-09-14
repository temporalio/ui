import { page } from '$app/state';

import {
  type CatalogSessionStore,
  createCatalogSessionStore,
} from '$lib/catalog/browser/session-store';
import {
  catalogStartAllowed,
  type WorkbenchHost,
} from '$lib/catalog/browser/workbench-host';
import { createApiWorkbenchHost } from '$lib/catalog/host/ui-services';

import { resolveCatalogForNamespace } from './catalog';

export type CatalogServices = {
  host: WorkbenchHost;
  sessionStore: CatalogSessionStore;
};

export type CatalogServiceOptions = {
  namespace: string;
  namespaceWriteDisabled: (namespace: string) => boolean;
  getIdentity?: () => string | undefined;
};

const workflowStartsDisabled = () =>
  (page.data?.settings as { startWorkflowDisabled?: boolean } | undefined)
    ?.startWorkflowDisabled ?? false;

const createCatalogServices = ({
  namespace,
  namespaceWriteDisabled,
  getIdentity,
}: CatalogServiceOptions): CatalogServices => {
  const host = createApiWorkbenchHost({
    descriptors: resolveCatalogForNamespace(namespace),
    getIdentity,
  });
  const sessionStore = createCatalogSessionStore(host, {
    startAllowed: (descriptor) =>
      catalogStartAllowed(descriptor, {
        disableWriteActions: page.data?.settings?.disableWriteActions ?? false,
        workflowStartsDisabled: workflowStartsDisabled(),
        namespaceWriteDisabled,
      }),
  });

  return { host, sessionStore };
};

const servicesByNamespace = new Map<string, CatalogServices>();

export const getCatalogServices = (
  options: CatalogServiceOptions,
): CatalogServices => {
  const existing = servicesByNamespace.get(options.namespace);
  if (existing) return existing;

  const services = createCatalogServices(options);
  servicesByNamespace.set(options.namespace, services);

  return services;
};
