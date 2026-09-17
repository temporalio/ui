import UrlPattern from 'url-pattern';

import type {
  IframeExtension,
  IframeExtensionSandbox,
  IframeExtensionSizing,
} from '$lib/types/global';

import {
  type ExtensionContext,
  TEMPORAL_EXTENSION_PERMISSIONS,
  TEMPORAL_EXTENSION_SLOTS,
  type TemporalExtensionPermission,
  type TemporalExtensionSlot,
} from './types';

const urlPatternOptions = { segmentValueCharset: '^/' };

const DEFAULT_HEIGHT = 160;
const MIN_HEIGHT = 32;
const MAX_HEIGHT = 800;
const MIN_WIDTH = 32;
const MAX_WIDTH = 1200;
const EXPLICIT_URL = /^[a-zA-Z][a-zA-Z\d+.-]*:|^\/\//;
const NAVIGATION_ROOTS = ['/namespaces', '/nexus', '/import'] as const;

export const IFRAME_PERMISSIONS_POLICY = [
  "accelerometer 'none'",
  "autoplay 'none'",
  "camera 'none'",
  "clipboard-read 'none'",
  "clipboard-write 'none'",
  "compute-pressure 'none'",
  "display-capture 'none'",
  "encrypted-media 'none'",
  "fullscreen 'none'",
  "gamepad 'none'",
  "geolocation 'none'",
  "gyroscope 'none'",
  "hid 'none'",
  "microphone 'none'",
  "midi 'none'",
  "otp-credentials 'none'",
  "payment 'none'",
  "picture-in-picture 'none'",
  "publickey-credentials-create 'none'",
  "publickey-credentials-get 'none'",
  "screen-wake-lock 'none'",
  "serial 'none'",
  "storage-access 'none'",
  "usb 'none'",
  "web-share 'none'",
  "window-management 'none'",
  "xr-spatial-tracking 'none'",
].join('; ');

export type ExtensionSlotLayoutPolicy = {
  defaultHeight: number;
  defaultWidth?: number;
  minHeight: number;
  maxHeight: number;
  minWidth: number;
  maxWidth: number;
  maxExtensions: number;
};

export const EXTENSION_SLOT_LAYOUT = {
  'app.top-nav.actions.before': {
    defaultHeight: 32,
    defaultWidth: 160,
    minHeight: 24,
    maxHeight: 40,
    minWidth: 32,
    maxWidth: 320,
    maxExtensions: 2,
  },
  'app.top-nav.actions.after': {
    defaultHeight: 32,
    defaultWidth: 160,
    minHeight: 24,
    maxHeight: 40,
    minWidth: 32,
    maxWidth: 320,
    maxExtensions: 2,
  },
  'app.top-nav.sub-nav': {
    defaultHeight: 48,
    minHeight: 32,
    maxHeight: 240,
    minWidth: 32,
    maxWidth: 1200,
    maxExtensions: 2,
  },
  'workflow.header.after-details': {
    defaultHeight: 160,
    minHeight: 32,
    maxHeight: 640,
    minWidth: 32,
    maxWidth: 1200,
    maxExtensions: 4,
  },
} as const satisfies Record<TemporalExtensionSlot, ExtensionSlotLayoutPolicy>;

const positiveOrUndefined = (value: number | undefined): number | undefined => {
  return typeof value === 'number' && value > 0 ? value : undefined;
};

const isLoopbackHostname = (hostname: string): boolean => {
  const value = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (value === 'localhost' || value === '::1') return true;

  const octets = value.split('.');
  return (
    octets.length === 4 &&
    octets[0] === '127' &&
    octets.every((octet) => /^\d{1,3}$/.test(octet) && Number(octet) <= 255)
  );
};

const isLocalHttpURL = (url: URL) => {
  return url.protocol === 'http:' && isLoopbackHostname(url.hostname);
};

export const isTemporalExtensionSlot = (
  slot: string,
): slot is TemporalExtensionSlot => {
  return (TEMPORAL_EXTENSION_SLOTS as readonly string[]).includes(slot);
};

export const isTemporalExtensionPermission = (
  permission: string,
): permission is TemporalExtensionPermission => {
  return (TEMPORAL_EXTENSION_PERMISSIONS as readonly string[]).includes(
    permission,
  );
};

export const normalizeBasePath = (basePath: string): string => {
  const trimmed = basePath.trim();
  if (!trimmed || trimmed === '/') return '';
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}`;
};

const isPathWithinBase = (pathname: string, basePath: string): boolean => {
  const normalizedBasePath = normalizeBasePath(basePath);
  if (!normalizedBasePath) return pathname.startsWith('/');

  return (
    pathname === normalizedBasePath ||
    pathname.startsWith(`${normalizedBasePath}/`)
  );
};

const appPathFromURL = (pathname: string, basePath: string): string | null => {
  const normalizedBasePath = normalizeBasePath(basePath);
  if (!isPathWithinBase(pathname, normalizedBasePath)) return null;
  if (!normalizedBasePath) return pathname;
  return pathname.slice(normalizedBasePath.length) || '/';
};

const isAllowedNavigationPath = (pathname: string): boolean => {
  if (pathname === '/') return true;
  return NAVIGATION_ROOTS.some(
    (root) => pathname === root || pathname.startsWith(`${root}/`),
  );
};

const resolveAppURL = (
  value: string,
  currentOrigin: string,
  basePath: string,
): URL => {
  const origin = new URL(currentOrigin).origin;
  const normalizedBasePath = normalizeBasePath(basePath);

  if (EXPLICIT_URL.test(value)) return new URL(value, origin);

  if (value.startsWith('/')) {
    const rootRelativeURL = new URL(value, origin);
    if (isPathWithinBase(rootRelativeURL.pathname, normalizedBasePath)) {
      return rootRelativeURL;
    }
    return new URL(`${normalizedBasePath}${value}`, origin);
  }

  return new URL(value, `${origin}${normalizedBasePath}/`);
};

export const resolveAllowedOrigin = (
  allowedOrigin: string,
  currentOrigin: string,
): string | null => {
  const value = allowedOrigin.trim();
  if (!value || value === '*') return null;
  if (value !== 'self' && /[?#\\]/.test(value)) return null;

  try {
    if (value === 'self') return new URL(currentOrigin).origin;

    const url = new URL(value);
    if (
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      (url.pathname && url.pathname !== '/')
    ) {
      return null;
    }
    if (url.protocol !== 'https:' && !isLocalHttpURL(url)) return null;
    return url.origin;
  } catch {
    return null;
  }
};

export const resolveExtensionSrc = (
  src: string,
  currentOrigin: string,
  basePath = '',
): URL | null => {
  const value = src.trim();
  if (!value || value.startsWith('//') || value.includes('\\')) return null;

  try {
    const origin = new URL(currentOrigin).origin;
    const url = resolveAppURL(value, origin, basePath);
    if (url.username || url.password) return null;
    if (url.protocol !== 'https:' && !isLocalHttpURL(url)) return null;
    if (url.origin === origin && !isPathWithinBase(url.pathname, basePath)) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
};

export const isIframeExtensionAllowed = (
  extension: IframeExtension,
  currentOrigin: string,
  basePath = '',
  authEnabled = false,
): boolean => {
  const uiOrigin = resolveAllowedOrigin('self', currentOrigin);
  const allowedOrigin = resolveAllowedOrigin(
    extension.allowedOrigin,
    currentOrigin,
  );
  const src = resolveExtensionSrc(extension.src, currentOrigin, basePath);

  if (!uiOrigin || !allowedOrigin || !src) return false;
  if (src.origin !== allowedOrigin) return false;
  if (authEnabled && src.origin === uiOrigin) return false;

  if (extension.permissions.length) {
    return effectiveAllowSameOrigin(extension, currentOrigin, basePath);
  }

  return true;
};

export const effectiveAllowSameOrigin = (
  extension: Pick<IframeExtension, 'allowedOrigin' | 'sandbox' | 'src'>,
  currentOrigin: string,
  basePath = '',
): boolean => {
  if (!extension.sandbox.allowSameOrigin) return false;

  const uiOrigin = resolveAllowedOrigin('self', currentOrigin);
  const allowedOrigin = resolveAllowedOrigin(
    extension.allowedOrigin,
    currentOrigin,
  );
  const src = resolveExtensionSrc(extension.src, currentOrigin, basePath);

  if (!uiOrigin || !allowedOrigin || !src) return false;
  if (src.origin !== allowedOrigin) return false;
  if (src.origin === uiOrigin) return false;

  return src.protocol === 'https:';
};

export const extensionMatchesRoute = (
  extension: Pick<IframeExtension, 'routePatterns'>,
  pathname: string,
  basePath = '',
): boolean => {
  const routePathname = appPathFromURL(pathname, basePath);
  if (!routePathname) return false;
  if (!extension.routePatterns.length) return true;

  return extension.routePatterns.some((pattern) => {
    try {
      if (new UrlPattern(pattern, urlPatternOptions).match(routePathname)) {
        return true;
      }

      if (pattern.endsWith('/*')) {
        const exactPattern = pattern.slice(0, -2);
        return !!new UrlPattern(exactPattern, urlPatternOptions).match(
          routePathname,
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
  slot: TemporalExtensionSlot,
  pathname: string,
  basePath = '',
): IframeExtension[] => {
  return extensions
    .filter(
      (extension) =>
        extension.slot === slot &&
        extensionMatchesRoute(extension, pathname, basePath),
    )
    .slice(0, EXTENSION_SLOT_LAYOUT[slot].maxExtensions);
};

export const buildIframeSandbox = (
  sandbox: IframeExtensionSandbox,
  allowSameOrigin = sandbox.allowSameOrigin,
): string => {
  const tokens = new Set(['allow-scripts']);

  if (sandbox.allowDownloads) tokens.add('allow-downloads');
  if (sandbox.allowForms) tokens.add('allow-forms');
  if (sandbox.allowModals) tokens.add('allow-modals');
  if (sandbox.allowPopups) tokens.add('allow-popups');
  if (allowSameOrigin) tokens.add('allow-same-origin');

  return [...tokens].join(' ');
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const constrainSizingToSlot = (
  sizing: IframeExtensionSizing,
  slot: TemporalExtensionSlot,
): IframeExtensionSizing => {
  const policy: ExtensionSlotLayoutPolicy = EXTENSION_SLOT_LAYOUT[slot];
  const minHeight = clamp(
    positiveOrUndefined(sizing.minHeight) ?? policy.minHeight,
    policy.minHeight,
    policy.maxHeight,
  );
  const maxHeight = clamp(
    positiveOrUndefined(sizing.maxHeight) ?? policy.maxHeight,
    minHeight,
    policy.maxHeight,
  );
  const minWidth = clamp(
    positiveOrUndefined(sizing.minWidth) ?? policy.minWidth,
    policy.minWidth,
    policy.maxWidth,
  );
  const maxWidth = clamp(
    positiveOrUndefined(sizing.maxWidth) ?? policy.maxWidth,
    minWidth,
    policy.maxWidth,
  );
  const defaultWidth =
    positiveOrUndefined(sizing.defaultWidth) ?? policy.defaultWidth;

  return {
    defaultHeight: clamp(
      positiveOrUndefined(sizing.defaultHeight) ?? policy.defaultHeight,
      minHeight,
      maxHeight,
    ),
    minHeight,
    maxHeight,
    defaultWidth:
      defaultWidth == null
        ? undefined
        : clamp(defaultWidth, minWidth, maxWidth),
    minWidth,
    maxWidth,
  };
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
  permissions: readonly TemporalExtensionPermission[],
): ExtensionContext => {
  const allowed = new Set(permissions);

  return {
    uiVersion: context.uiVersion,
    ...(context.temporalVersion
      ? { temporalVersion: context.temporalVersion }
      : {}),
    basePath: context.basePath,
    ...(context.route && allowed.has('context:route')
      ? { route: context.route }
      : {}),
    ...(context.namespace && allowed.has('context:namespace')
      ? { namespace: context.namespace }
      : {}),
    ...(context.workflow && allowed.has('context:workflow')
      ? { workflow: context.workflow }
      : {}),
  };
};

export const safeNavigationPath = (
  href: string,
  currentOrigin: string,
  basePath = '',
): string | null => {
  try {
    const value = href.trim();
    if (!value) return null;

    const origin = new URL(currentOrigin).origin;
    const url = EXPLICIT_URL.test(value)
      ? new URL(value, origin)
      : resolveAppURL(value, origin, basePath);
    if (url.origin !== origin) return null;
    const appPath = appPathFromURL(url.pathname, basePath);
    if (!appPath || !isAllowedNavigationPath(appPath)) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
};
