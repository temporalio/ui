import { readable } from 'svelte/store';

interface Page<Params extends Record<string, string> = Record<string, string>> {
  url: URL;
  params: Params;
  routeId: string | null;
  stuff: App.Stuff;
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
  },
  defaultNamespace: 'default',
  disableWriteActions: false,
  showTemporalSystemNamespace: false,
  notifyOnNewVersion: true,
  feedbackURL: '',
  runtimeEnvironment: {
    isCloud: false,
    isLocal: true,
    envOverride: true,
  },
  version: '2.0.0',
};

const stuff: App.Stuff = {
  settings,
};

export const page = readable<Page>({
  error: null,
  params: {
    namespace: 'default',
  },
  routeId: 'namespaces/[namespace]/workflows@root',
  status: 200,
  stuff,
  url: new URL(
    'http://localhost:3000/namespaces/default/workflows?search=basic&query=WorkflowType%3D%22testing%22',
  ),
});
