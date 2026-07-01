import UrlPattern from 'url-pattern';

import type {
  IframeExtension,
  IframeExtensionSandbox,
  IframeExtensionSizing,
} from '$lib/types/global';

import type { ExtensionContext } from './types';

const urlPatternOptions = { segmentValueCharset: '^/' };

const DEFAULT_HEIGHT = 160;
const MIN_HEIGHT = 32;
const MAX_HEIGHT = 800;
const MIN_WIDTH = 32;
const MAX_WIDTH = 1200;
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

const positiveOrUndefined = (value: number | undefined): number | undefined => {
  return typeof value === 'number' && value > 0 ? value : undefined;
};

const isLocalHttpURL = (url: URL) => {
  return url.protocol === 'http:' && LOCAL_HOSTNAMES.has(url.hostname);
};

export const resolveAllowedOrigin = (
  allowedOrigin: string,
  currentOrigin: string,
): string | null => {
  const value = allowedOrigin.trim();
  if (!value || value === '*') return null;
  if (value === 'self') return currentOrigin;

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && !isLocalHttpURL(url)) return null;
    return url.origin;
  } catch {
    return null;
  }
};

export const resolveExtensionSrc = (
  src: string,
  currentOrigin: string,
): URL | null => {
  if (!src.trim()) return null;

  try {
    const url = new URL(src, currentOrigin);
    if (url.protocol === 'https:' || isLocalHttpURL(url)) return url;
  } catch {
    return null;
  }

  return null;
};

export const isIframeExtensionAllowed = (
  extension: IframeExtension,
  currentOrigin: string,
): boolean => {
  const allowedOrigin = resolveAllowedOrigin(
    extension.allowedOrigin,
    currentOrigin,
  );
  const src = resolveExtensionSrc(extension.src, currentOrigin);

  if (!allowedOrigin || !src) return false;
  return src.origin === allowedOrigin;
};

export const extensionMatchesRoute = (
  extension: Pick<IframeExtension, 'routePatterns'>,
  pathname: string,
): boolean => {
  if (!extension.routePatterns.length) return true;

  return extension.routePatterns.some((pattern) => {
    try {
      if (new UrlPattern(pattern, urlPatternOptions).match(pathname)) {
        return true;
      }

      if (pattern.endsWith('/*')) {
        const exactPattern = pattern.slice(0, -2);
        return !!new UrlPattern(exactPattern, urlPatternOptions).match(
          pathname,
        );
      }

      return false;
    } catch {
      return false;
    }
  });
};

export const extensionsForSlot = (
  extensions: IframeExtension[],
  slot: string,
  pathname: string,
): IframeExtension[] => {
  return extensions.filter(
    (extension) =>
      extension.slot === slot && extensionMatchesRoute(extension, pathname),
  );
};

export const buildIframeSandbox = (sandbox: IframeExtensionSandbox): string => {
  const tokens = new Set(['allow-scripts']);

  if (sandbox.allowDownloads) tokens.add('allow-downloads');
  if (sandbox.allowForms) tokens.add('allow-forms');
  if (sandbox.allowModals) tokens.add('allow-modals');
  if (sandbox.allowPopups || sandbox.allowPopupsToEscapeSandbox) {
    tokens.add('allow-popups');
  }
  if (sandbox.allowPopupsToEscapeSandbox) {
    tokens.add('allow-popups-to-escape-sandbox');
  }
  if (sandbox.allowSameOrigin) tokens.add('allow-same-origin');

  return [...tokens].join(' ');
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const initialHeight = (sizing: IframeExtensionSizing): number => {
  const minHeight = positiveOrUndefined(sizing.minHeight) ?? MIN_HEIGHT;
  const maxHeight = positiveOrUndefined(sizing.maxHeight) ?? MAX_HEIGHT;
  return clamp(
    positiveOrUndefined(sizing.defaultHeight) ?? DEFAULT_HEIGHT,
    minHeight,
    maxHeight,
  );
};

export const initialWidth = (
  sizing: IframeExtensionSizing,
): number | undefined => {
  const defaultWidth = positiveOrUndefined(sizing.defaultWidth);
  if (defaultWidth == null) return undefined;

  const minWidth = positiveOrUndefined(sizing.minWidth) ?? MIN_WIDTH;
  const maxWidth = positiveOrUndefined(sizing.maxWidth) ?? MAX_WIDTH;
  return clamp(defaultWidth, minWidth, maxWidth);
};

export const clampHeight = (
  height: number,
  sizing: IframeExtensionSizing,
): number => {
  return clamp(
    height,
    positiveOrUndefined(sizing.minHeight) ?? MIN_HEIGHT,
    positiveOrUndefined(sizing.maxHeight) ?? MAX_HEIGHT,
  );
};

export const clampWidth = (
  width: number,
  sizing: IframeExtensionSizing,
): number => {
  return clamp(
    width,
    positiveOrUndefined(sizing.minWidth) ?? MIN_WIDTH,
    positiveOrUndefined(sizing.maxWidth) ?? MAX_WIDTH,
  );
};

export const permittedContext = (
  context: ExtensionContext,
  permissions: string[],
): ExtensionContext => {
  const allowed = new Set(permissions);
  const { workflow, user, ...baseContext } = context;

  return {
    ...baseContext,
    ...(workflow && allowed.has('context:workflow') ? { workflow } : {}),
    ...(user && allowed.has('context:user') ? { user } : {}),
  };
};

export const safeNavigationPath = (
  href: string,
  currentOrigin: string,
): string | null => {
  try {
    const url = new URL(href, currentOrigin);
    if (url.origin !== currentOrigin) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
};
