export const TEMPORAL_EXTENSION_MESSAGE_VERSION = 1;

export const TEMPORAL_EXTENSION_SLOTS = [
  'app.top-nav.actions.after',
  'workflow.header.after-details',
  'app.top-nav.sub-nav',
] as const;

export type TemporalExtensionSlot = (typeof TEMPORAL_EXTENSION_SLOTS)[number];

export type ExtensionRouteContext = {
  pathname: string;
  search: string;
  params: Record<string, string>;
};

export type ExtensionWorkflowContext = {
  workflowId: string;
  runId: string;
  status?: string;
  taskQueue?: string;
  workflowType?: string;
};

export type ExtensionUserContext = {
  email?: string;
};

export type ExtensionContext = {
  uiVersion: string;
  temporalVersion?: string;
  basePath: string;
  route: ExtensionRouteContext;
  namespace?: string;
  workflow?: ExtensionWorkflowContext;
  user?: ExtensionUserContext;
};

export type HostContextMessage = {
  type: 'temporal-ui/context';
  version: typeof TEMPORAL_EXTENSION_MESSAGE_VERSION;
  extensionId: string;
  context: ExtensionContext;
};

export type HostThemeMessage = {
  type: 'temporal-ui/theme';
  version: typeof TEMPORAL_EXTENSION_MESSAGE_VERSION;
  extensionId: string;
  theme: 'light' | 'dark';
};

export type HostMessage = HostContextMessage | HostThemeMessage;

export type ExtensionReadyMessage = {
  type: 'temporal-extension/ready';
  version: typeof TEMPORAL_EXTENSION_MESSAGE_VERSION;
  extensionId: string;
};

export type ExtensionResizeMessage = {
  type: 'temporal-extension/resize';
  version: typeof TEMPORAL_EXTENSION_MESSAGE_VERSION;
  extensionId: string;
  height?: number;
  width?: number;
};

export type ExtensionNavigateMessage = {
  type: 'temporal-extension/navigate';
  version: typeof TEMPORAL_EXTENSION_MESSAGE_VERSION;
  extensionId: string;
  href: string;
};

export type ExtensionMessage =
  | ExtensionReadyMessage
  | ExtensionResizeMessage
  | ExtensionNavigateMessage;
