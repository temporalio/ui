<script lang="ts">
  import { onMount } from 'svelte';

  import { goto } from '$app/navigation';

  import {
    buildIframeSandbox,
    clampHeight,
    clampWidth,
    constrainSizingToSlot,
    effectiveAllowSameOrigin,
    EXTENSION_SLOT_LAYOUT,
    IFRAME_PERMISSIONS_POLICY,
    initialHeight,
    initialWidth,
    isIframeExtensionAllowed,
    permittedContext,
    resolveAllowedOrigin,
    resolveExtensionSrc,
    safeNavigationPath,
  } from '$lib/extensions/iframe-extensions';
  import {
    createContextMessage,
    createThemeMessage,
    createViewportMessage,
    createWelcomeMessage,
    parseExtensionMessage,
  } from '$lib/extensions/messages';
  import type { ExtensionContext, HostMessage } from '$lib/extensions/types';
  import type { IframeExtension } from '$lib/types/global';
  import { useDarkMode } from '$lib/utilities/dark-mode/dark-mode';

  const WELCOME_RATE_LIMIT_MS = 250;
  const NAVIGATION_RATE_LIMIT_MS = 500;

  interface Props {
    extension: IframeExtension;
    context: ExtensionContext;
    currentOrigin: string;
    basePath: string;
    authEnabled: boolean;
  }

  let { extension, context, currentOrigin, basePath, authEnabled }: Props =
    $props();

  let iframe: HTMLIFrameElement | null = $state(null);
  let container: HTMLDivElement | null = $state(null);
  let ready = $state(false);
  let instanceId = $state('');
  let height = $state(initialHeight({}));
  let width: number | undefined = $state(undefined);
  let pendingResize: { height?: number; width?: number } | null = null;
  let resizeFrame: number | null = null;
  let viewportFrame: number | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let lastWelcomeAt = 0;
  let lastNavigationAt = 0;

  const createInstanceId = (): string => {
    if (!globalThis.crypto) return '';
    if (typeof globalThis.crypto.randomUUID === 'function') {
      return globalThis.crypto.randomUUID();
    }

    const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
    return [...bytes]
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  };

  const allowedOrigin = $derived(
    resolveAllowedOrigin(extension.allowedOrigin, currentOrigin),
  );
  const src = $derived(
    resolveExtensionSrc(extension.src, currentOrigin, basePath),
  );
  const allowed = $derived(
    isIframeExtensionAllowed(extension, currentOrigin, basePath, authEnabled),
  );
  const allowSameOrigin = $derived(
    effectiveAllowSameOrigin(extension, currentOrigin, basePath),
  );
  const sizing = $derived(
    constrainSizingToSlot(extension.sizing, extension.slot),
  );
  const slotLayout = $derived(EXTENSION_SLOT_LAYOUT[extension.slot]);
  const sandbox = $derived(
    buildIframeSandbox(extension.sandbox, allowSameOrigin),
  );
  const theme = $derived($useDarkMode ? 'dark' : 'light');
  const containerStyle = $derived(
    `height: ${height}px; max-height: ${slotLayout.maxHeight}px; width: ${width == null ? '100%' : `${width}px`}; max-width: 100%;`,
  );
  const messageTargetOrigin = $derived(allowSameOrigin ? allowedOrigin : '*');
  const grantedPermissions = $derived(
    allowSameOrigin ? extension.permissions : [],
  );

  const messageOriginMatches = (event: MessageEvent) => {
    if (event.origin === allowedOrigin) return true;
    return !allowSameOrigin && event.origin === 'null';
  };

  const postMessageToIframe = (message: HostMessage) => {
    if (!iframe?.contentWindow || !messageTargetOrigin) return;
    iframe.contentWindow.postMessage(message, messageTargetOrigin);
  };

  const sendWelcome = (force = false) => {
    if (!instanceId) return;
    const now = Date.now();
    if (!force && now - lastWelcomeAt < WELCOME_RATE_LIMIT_MS) return;
    lastWelcomeAt = now;
    postMessageToIframe(
      createWelcomeMessage(extension.id, instanceId, grantedPermissions),
    );
  };

  const sendHostState = (
    nextContext: ExtensionContext = context,
    nextTheme: 'light' | 'dark' = theme,
  ) => {
    if (!ready || !instanceId) return;

    if (allowSameOrigin) {
      postMessageToIframe(
        createContextMessage(
          extension.id,
          instanceId,
          permittedContext(nextContext, extension.permissions),
        ),
      );
    }
    postMessageToIframe(
      createThemeMessage(extension.id, instanceId, nextTheme),
    );
  };

  const handleLoad = () => {
    ready = false;
    instanceId = createInstanceId();
    height = initialHeight(sizing);
    width = initialWidth(sizing);
    pendingResize = null;
    lastNavigationAt = 0;
    if (resizeFrame != null) cancelAnimationFrame(resizeFrame);
    if (viewportFrame != null) cancelAnimationFrame(viewportFrame);
    resizeFrame = null;
    viewportFrame = null;
    sendWelcome(true);
  };

  const sendViewport = () => {
    if (!ready || !instanceId || !container) return;
    const bounds = container.getBoundingClientRect();
    postMessageToIframe(
      createViewportMessage(
        extension.id,
        instanceId,
        extension.slot,
        bounds.width,
        height,
      ),
    );
  };

  const scheduleViewport = () => {
    if (!ready || viewportFrame != null) return;
    viewportFrame = requestAnimationFrame(() => {
      viewportFrame = null;
      sendViewport();
    });
  };

  const scheduleResize = (message: { height?: number; width?: number }) => {
    pendingResize = {
      ...(pendingResize ?? {}),
      ...(message.height != null ? { height: message.height } : {}),
      ...(message.width != null ? { width: message.width } : {}),
    };
    if (resizeFrame != null) return;

    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = null;
      const resize = pendingResize;
      pendingResize = null;
      if (!resize) return;

      if (resize.height != null) {
        height = clampHeight(resize.height, sizing);
      }
      if (resize.width != null) {
        width = clampWidth(resize.width, sizing);
      }
    });
  };

  const handleMessage = (event: MessageEvent) => {
    if (!iframe?.contentWindow) return;
    if (!allowedOrigin || !messageOriginMatches(event)) return;
    if (event.source !== iframe.contentWindow) return;

    const message = parseExtensionMessage(event.data);
    if (!message || message.extensionId !== extension.id) return;

    if (message.type === 'temporal-extension/hello') {
      sendWelcome();
      return;
    }

    if (!instanceId || message.instanceId !== instanceId) return;

    if (message.type === 'temporal-extension/ready') {
      if (ready) return;
      ready = true;
      scheduleViewport();
      return;
    }

    if (!ready) return;

    if (message.type === 'temporal-extension/resize') {
      scheduleResize(message);
      return;
    }

    if (
      message.type === 'temporal-extension/navigate' &&
      extension.permissions.includes('navigation:write')
    ) {
      const path = safeNavigationPath(message.href, currentOrigin, basePath);
      if (!path) return;

      const now = Date.now();
      if (now - lastNavigationAt < NAVIGATION_RATE_LIMIT_MS) return;
      lastNavigationAt = now;
      void goto(path);
    }
  };

  $effect(() => {
    height = initialHeight(sizing);
    width = initialWidth(sizing);
  });

  $effect(() => {
    const nextContext = context;
    const nextTheme = theme;
    if (ready) sendHostState(nextContext, nextTheme);
  });

  onMount(() => {
    window.addEventListener('message', handleMessage);
    if (typeof ResizeObserver !== 'undefined' && container) {
      resizeObserver = new ResizeObserver(scheduleViewport);
      resizeObserver.observe(container);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
      resizeObserver?.disconnect();
      if (resizeFrame != null) cancelAnimationFrame(resizeFrame);
      if (viewportFrame != null) cancelAnimationFrame(viewportFrame);
    };
  });
</script>

{#if allowed && src && allowedOrigin}
  <div
    bind:this={container}
    data-temporal-extension-id={extension.id}
    class="overflow-hidden bg-transparent"
    style={containerStyle}
  >
    <iframe
      bind:this={iframe}
      title={extension.title}
      src={src.href}
      {sandbox}
      allow={IFRAME_PERMISSIONS_POLICY}
      referrerpolicy="no-referrer"
      loading="lazy"
      class="block h-full w-full border-0 bg-transparent"
      onload={handleLoad}
    ></iframe>
  </div>
{/if}
