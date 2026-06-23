import type { Settings } from '$lib/types/global';

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
  workflowPauseDisabled: false,
  workflowCancelDisabled: false,
  workflowSignalDisabled: false,
  workflowUpdateDisabled: false,
  workflowTerminateDisabled: false,
  hideWorkflowQueryErrors: false,
  activityCommandsDisabled: false,
  feedbackURL: '',
  runtimeEnvironment: {
    isCloud: false,
    isLocal: true,
    envOverride: true,
  },
  version: '2.28.0',
};

export const page = {
  error: null,
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
