import { readable } from 'svelte/store';

import type { Settings } from '$lib/types/global';

interface Page<Params extends Record<string, string> = Record<string, string>> {
  url: URL;
  params: Params;
  routeId: string | null;
  data: App.PageData;
  status: number;
  error: Error | null;
}

const settings: Settings = {
  auth: {
    enabled: false,
    options: null,
  },
  baseUrl: 'http://localhost:3000',
  codec: {
    endpoint: '',
    passAccessToken: false,
    includeCredentials: false,
  },
  defaultNamespace: 'default',
  disableWriteActions: false,
  showTemporalSystemNamespace: false,
  batchActionsDisabled: false,
  workflowResetDisabled: false,
  workflowCancelDisabled: false,
  workflowSignalDisabled: false,
  workflowTerminateDisabled: false,
  hideWorkflowQueryErrors: false,
  notifyOnNewVersion: true,
  feedbackURL: '',
  runtimeEnvironment: {
    isCloud: false,
    isLocal: true,
    envOverride: true,
  },
  version: '2.0.0',
};

const data: App.PageData = {
  settings,
};

export const page = readable<Page>({
  error: null,
  params: {
    namespace: 'default',
  },
  routeId: 'namespaces/[namespace]/workflows@root',
  status: 200,
  data,
  url: new URL(
    'http://localhost:3000/namespaces/default/workflows?search=basic&query=WorkflowType%3D%22testing%22',
  ),
});
