export const TEMPORAL_EXTENSION_MESSAGE_VERSION = 1;

export const TEMPORAL_EXTENSION_SLOTS = [
  'app.top-nav.actions.before',
  'app.top-nav.actions.after',
  'workflow.header.after-details',
  'app.top-nav.sub-nav',
] as const;

export type TemporalExtensionSlot = (typeof TEMPORAL_EXTENSION_SLOTS)[number];

export const TEMPORAL_EXTENSION_PERMISSIONS = [
  'context:route',
  'context:namespace',
  'context:workflow',
  'navigation:write',
] as const;

export type TemporalExtensionPermission =
  (typeof TEMPORAL_EXTENSION_PERMISSIONS)[number];

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

export type ExtensionContext = {
  uiVersion: string;
  temporalVersion?: string;
  basePath: string;
  route?: ExtensionRouteContext;
  namespace?: string;
  workflow?: ExtensionWorkflowContext;
};

type HostMessageBase = {
  version: typeof TEMPORAL_EXTENSION_MESSAGE_VERSION;
  extensionId: string;
  instanceId: string;
};

export type HostWelcomeMessage = HostMessageBase & {
  type: 'temporal-ui/welcome';
  permissions: TemporalExtensionPermission[];
};

export type HostContextMessage = HostMessageBase & {
  type: 'temporal-ui/context';
  context: ExtensionContext;
};

export type HostThemeMessage = HostMessageBase & {
  type: 'temporal-ui/theme';
  theme: 'light' | 'dark';
};

export type HostViewportMessage = HostMessageBase & {
  type: 'temporal-ui/viewport';
  slot: TemporalExtensionSlot;
  width: number;
  height: number;
};

export type HostMessage =
  | HostWelcomeMessage
  | HostContextMessage
  | HostThemeMessage
  | HostViewportMessage;

type ExtensionMessageBase = {
  version: typeof TEMPORAL_EXTENSION_MESSAGE_VERSION;
  extensionId: string;
  instanceId: string;
};

export type ExtensionHelloMessage = Omit<ExtensionMessageBase, 'instanceId'> & {
  type: 'temporal-extension/hello';
};

export type ExtensionReadyMessage = ExtensionMessageBase & {
  type: 'temporal-extension/ready';
};

export type ExtensionResizeMessage = ExtensionMessageBase & {
  type: 'temporal-extension/resize';
  height?: number;
  width?: number;
};

export type ExtensionNavigateMessage = ExtensionMessageBase & {
  type: 'temporal-extension/navigate';
  href: string;
};

export type ExtensionMessage =
  | ExtensionHelloMessage
  | ExtensionReadyMessage
  | ExtensionResizeMessage
  | ExtensionNavigateMessage;
