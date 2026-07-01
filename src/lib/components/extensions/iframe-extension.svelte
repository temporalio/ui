<script lang="ts">
  import { onMount } from 'svelte';

  import { goto } from '$app/navigation';

  import {
    buildIframeSandbox,
    clampHeight,
    clampWidth,
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
    parseExtensionMessage,
  } from '$lib/extensions/messages';
  import type { ExtensionContext, HostMessage } from '$lib/extensions/types';
  import type { IframeExtension } from '$lib/types/global';
  import { useDarkMode } from '$lib/utilities/dark-mode/dark-mode';

  interface Props {
    extension: IframeExtension;
    context: ExtensionContext;
    currentOrigin: string;
  }

  let { extension, context, currentOrigin }: Props = $props();

  let iframe: HTMLIFrameElement | null = $state(null);
  let loaded = $state(false);
  let height = $state(initialHeight({}));
  let width: number | undefined = $state(undefined);
  let lastResizeAt = 0;

  const allowedOrigin = $derived(
    resolveAllowedOrigin(extension.allowedOrigin, currentOrigin),
  );
  const src = $derived(resolveExtensionSrc(extension.src, currentOrigin));
  const allowed = $derived(isIframeExtensionAllowed(extension, currentOrigin));
  const sandbox = $derived(buildIframeSandbox(extension.sandbox));
  const theme = $derived($useDarkMode ? 'dark' : 'light');
  const containerStyle = $derived(
    `height: ${height}px; width: ${width == null ? '100%' : `${width}px`};`,
  );
  const messageTargetOrigin = $derived(
    extension.sandbox.allowSameOrigin ? allowedOrigin : '*',
  );

  const messageOriginMatches = (event: MessageEvent) => {
    if (event.origin === allowedOrigin) return true;
    return !extension.sandbox.allowSameOrigin && event.origin === 'null';
  };

  const postMessageToIframe = (message: HostMessage) => {
    if (!iframe?.contentWindow || !messageTargetOrigin) return;
    iframe.contentWindow.postMessage(message, messageTargetOrigin);
  };

  const sendHostState = (
    nextContext: ExtensionContext = context,
    nextTheme: 'light' | 'dark' = theme,
  ) => {
    postMessageToIframe(
      createContextMessage(
        extension.id,
        permittedContext(nextContext, extension.permissions),
      ),
    );
    postMessageToIframe(createThemeMessage(extension.id, nextTheme));
  };

  const handleLoad = () => {
    loaded = true;
    sendHostState();
  };

  const handleMessage = (event: MessageEvent) => {
    if (!iframe?.contentWindow) return;
    if (!allowedOrigin || !messageOriginMatches(event)) return;
    if (event.source !== iframe.contentWindow) return;

    const message = parseExtensionMessage(event.data);
    if (!message || message.extensionId !== extension.id) return;

    if (message.type === 'temporal-extension/ready') {
      sendHostState();
      return;
    }

    if (message.type === 'temporal-extension/resize') {
      const now = Date.now();
      if (now - lastResizeAt < 50) return;
      lastResizeAt = now;

      if (message.height != null) {
        height = clampHeight(message.height, extension.sizing);
      }
      if (message.width != null) {
        width = clampWidth(message.width, extension.sizing);
      }
      return;
    }

    if (
      message.type === 'temporal-extension/navigate' &&
      extension.permissions.includes('navigation:write')
    ) {
      const path = safeNavigationPath(message.href, currentOrigin);
      if (path) void goto(path);
    }
  };

  $effect(() => {
    const sizing = extension.sizing;
    height = initialHeight(sizing);
    width = initialWidth(sizing);
  });

  $effect(() => {
    const nextContext = context;
    const nextTheme = theme;
    if (loaded) sendHostState(nextContext, nextTheme);
  });

  onMount(() => {
    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  });
</script>

{#if allowed && src && allowedOrigin}
  <div
    data-temporal-extension-id={extension.id}
    class="overflow-hidden bg-transparent"
    style={containerStyle}
  >
    <iframe
      bind:this={iframe}
      title={extension.title}
      src={src.href}
      {sandbox}
      referrerpolicy="strict-origin-when-cross-origin"
      loading="lazy"
      class="block h-full w-full border-0 bg-transparent"
      onload={handleLoad}
    ></iframe>
  </div>
{/if}
