import type { Settings } from '$lib/types/global';

const settings: Settings = {
  auth: {
    enabled: false,
    options: null,
    redirectToProvider: false,
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
  navCollapsedByDefault: false,
  batchActionsDisabled: false,
  workflowResetDisabled: false,
  workflowPauseDisabled: false,
  workflowCancelDisabled: false,
  workflowSignalDisabled: false,
  workflowUpdateDisabled: false,
  workflowTerminateDisabled: false,
  hideWorkflowQueryErrors: false,
  activityCommandsDisabled: false,
  feedbackURL: '',
  disableNewsFetch: false,
  runtimeEnvironment: {
    isCloud: false,
    isLocal: true,
    envOverride: true,
  },
  version: '2.28.0',
};

export const page = {
  error: null as App.Error | null,
  params: {
    namespace: 'default',
  },
  routeId: 'namespaces/[namespace]/workflows@root',
  status: 200,
  data: {
    settings,
  } as App.PageData,
  url: new URL(
    'http://localhost:3000/namespaces/default/workflows?search=basic&query=WorkflowType%3D%22testing%22',
  ),
};
