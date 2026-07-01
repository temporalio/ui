import type {
  ExtensionContext,
  ExtensionMessage,
  HostContextMessage,
  HostThemeMessage,
} from './types';
import { TEMPORAL_EXTENSION_MESSAGE_VERSION } from './types';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isExtensionMessageType = (
  type: unknown,
): type is ExtensionMessage['type'] => {
  return (
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
  if (typeof data.extensionId !== 'string') return null;
  if (!isExtensionMessageType(data.type)) return null;

  if (data.type === 'temporal-extension/ready') {
    return {
      type: data.type,
      version: TEMPORAL_EXTENSION_MESSAGE_VERSION,
      extensionId: data.extensionId,
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
      height,
      width,
    };
  }

  if (typeof data.href !== 'string') return null;

  return {
    type: data.type,
    version: TEMPORAL_EXTENSION_MESSAGE_VERSION,
    extensionId: data.extensionId,
    href: data.href,
  };
};

export const createContextMessage = (
  extensionId: string,
  context: ExtensionContext,
): HostContextMessage => ({
  type: 'temporal-ui/context',
  version: TEMPORAL_EXTENSION_MESSAGE_VERSION,
  extensionId,
  context,
});

export const createThemeMessage = (
  extensionId: string,
  theme: HostThemeMessage['theme'],
): HostThemeMessage => ({
  type: 'temporal-ui/theme',
  version: TEMPORAL_EXTENSION_MESSAGE_VERSION,
  extensionId,
  theme,
});
