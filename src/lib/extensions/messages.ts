import type {
  ExtensionContext,
  ExtensionMessage,
  HostContextMessage,
  HostThemeMessage,
  HostViewportMessage,
  HostWelcomeMessage,
  TemporalExtensionPermission,
  TemporalExtensionSlot,
} from './types';
import { TEMPORAL_EXTENSION_MESSAGE_VERSION } from './types';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const MAX_EXTENSION_ID_LENGTH = 128;
const MAX_INSTANCE_ID_LENGTH = 128;
const MAX_NAVIGATION_HREF_LENGTH = 2048;

const isExtensionMessageType = (
  type: unknown,
): type is ExtensionMessage['type'] => {
  return (
    type === 'temporal-extension/hello' ||
    type === 'temporal-extension/ready' ||
    type === 'temporal-extension/resize' ||
    type === 'temporal-extension/navigate'
  );
};

export const parseExtensionMessage = (
  data: unknown,
): ExtensionMessage | null => {
  if (!isRecord(data)) return null;
  if (data.version !== TEMPORAL_EXTENSION_MESSAGE_VERSION) return null;
  if (
    typeof data.extensionId !== 'string' ||
    !data.extensionId ||
    data.extensionId.length > MAX_EXTENSION_ID_LENGTH
  ) {
    return null;
  }
  if (!isExtensionMessageType(data.type)) return null;

  if (data.type === 'temporal-extension/hello') {
    return {
      type: data.type,
      version: TEMPORAL_EXTENSION_MESSAGE_VERSION,
      extensionId: data.extensionId,
    };
  }

  if (
    typeof data.instanceId !== 'string' ||
    !data.instanceId ||
    data.instanceId.length > MAX_INSTANCE_ID_LENGTH
  ) {
    return null;
  }

  if (data.type === 'temporal-extension/ready') {
    return {
      type: data.type,
      version: TEMPORAL_EXTENSION_MESSAGE_VERSION,
      extensionId: data.extensionId,
      instanceId: data.instanceId,
    };
  }

  if (data.type === 'temporal-extension/resize') {
    const height =
      typeof data.height === 'number' && Number.isFinite(data.height)
        ? data.height
        : undefined;
    const width =
      typeof data.width === 'number' && Number.isFinite(data.width)
        ? data.width
        : undefined;

    if (height == null && width == null) return null;

    return {
      type: data.type,
      version: TEMPORAL_EXTENSION_MESSAGE_VERSION,
      extensionId: data.extensionId,
      instanceId: data.instanceId,
      height,
      width,
    };
  }

  if (
    typeof data.href !== 'string' ||
    !data.href ||
    data.href.length > MAX_NAVIGATION_HREF_LENGTH
  ) {
    return null;
  }

  return {
    type: data.type,
    version: TEMPORAL_EXTENSION_MESSAGE_VERSION,
    extensionId: data.extensionId,
    instanceId: data.instanceId,
    href: data.href,
  };
};

export const createWelcomeMessage = (
  extensionId: string,
  instanceId: string,
  permissions: TemporalExtensionPermission[],
): HostWelcomeMessage => ({
  type: 'temporal-ui/welcome',
  version: TEMPORAL_EXTENSION_MESSAGE_VERSION,
  extensionId,
  instanceId,
  permissions,
});

export const createContextMessage = (
  extensionId: string,
  instanceId: string,
  context: ExtensionContext,
): HostContextMessage => ({
  type: 'temporal-ui/context',
  version: TEMPORAL_EXTENSION_MESSAGE_VERSION,
  extensionId,
  instanceId,
  context,
});

export const createThemeMessage = (
  extensionId: string,
  instanceId: string,
  theme: HostThemeMessage['theme'],
): HostThemeMessage => ({
  type: 'temporal-ui/theme',
  version: TEMPORAL_EXTENSION_MESSAGE_VERSION,
  extensionId,
  instanceId,
  theme,
});

export const createViewportMessage = (
  extensionId: string,
  instanceId: string,
  slot: TemporalExtensionSlot,
  width: number,
  height: number,
): HostViewportMessage => ({
  type: 'temporal-ui/viewport',
  version: TEMPORAL_EXTENSION_MESSAGE_VERSION,
  extensionId,
  instanceId,
  slot,
  width,
  height,
});
