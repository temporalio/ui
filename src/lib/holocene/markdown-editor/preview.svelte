<script lang="ts">
  import { type ClassNameValue, twMerge } from 'tailwind-merge';

  import { resolve } from '$app/paths';
  import { page } from '$app/state';

  import { useDarkMode } from '$lib/utilities/dark-mode';

  interface Props {
    content: string;
    class?: ClassNameValue;
    overrideTheme?:
      | 'background'
      | 'primary'
      | 'info'
      | 'details'
      | ''
      | undefined;
    fill?: boolean;
    frameId?: string;
    inline?: boolean;
    minHeight?: number;
    previewTheme?: 'dark' | 'light';
    title?: string;
  }

  let {
    content,
    class: className = '',
    fill = true,
    overrideTheme = '',
    frameId = '',
    inline = false,
    minHeight = 100,
    previewTheme,
    title = 'output',
  }: Props = $props();

  let iframe: HTMLIFrameElement | null = $state(null);
  let iframeWidth = 0;

  const parsePixels = (value: string | undefined) => {
    const parsed = Number.parseFloat(value ?? '0');
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getRenderedHeight = (iframeDocument: Document) => {
    const { body } = iframeDocument;
    const main = iframeDocument.querySelector('main');
    const view = iframeDocument.defaultView;
    const bodyStyles = view?.getComputedStyle(body);
    const verticalBodyPadding =
      parsePixels(bodyStyles?.paddingTop) +
      parsePixels(bodyStyles?.paddingBottom);
    const contentHeight = main
      ? Math.max(main.scrollHeight, main.getBoundingClientRect().height) +
        verticalBodyPadding
      : body.getBoundingClientRect().height;

    return Math.ceil(Math.max(contentHeight, minHeight));
  };

  const getRenderedWidth = (iframeDocument: Document) => {
    const { body } = iframeDocument;
    const main = iframeDocument.querySelector('main');
    const contentWidth = main
      ? Math.max(main.scrollWidth, main.getBoundingClientRect().width)
      : Math.max(body.scrollWidth, body.getBoundingClientRect().width);

    return Math.ceil(contentWidth);
  };

  const resizeIframe = () => {
    if (!iframe) return;
    const iframeDocument = iframe.contentDocument;
    if (!iframeDocument) return;

    if (inline) {
      iframe.width = '0';
      iframe.style.width = '0px';
      const width = getRenderedWidth(iframeDocument);
      iframe.width = `${width}`;
      iframe.style.width = `${width}px`;
    }

    iframe.height = '0';
    iframe.style.height = '0px';

    const height = getRenderedHeight(iframeDocument);
    iframe.height = `${height + 2}`;
    iframe.style.height = `${height + 2}px`;
  };

  $effect(() => {
    if (!iframe || inline || typeof ResizeObserver === 'undefined') return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      if (width === iframeWidth) return;

      iframeWidth = width;
      resizeIframe();
    });

    resizeObserver.observe(iframe);
    return () => resizeObserver.disconnect();
  });

  const { workflow: workflowId, run: runId, namespace } = page.params;

  const replaceTemplate = (content: string) => {
    if (namespace) {
      content = content.replace(/\{namespace\}/g, namespace);
    }
    if (workflowId) {
      content = content.replace(/\{workflowId\}/g, workflowId);
    }
    if (runId) {
      content = content.replace(/\{runId\}/g, runId);
    }
    return content;
  };

  const templatedContent = $derived(replaceTemplate(content));
  const resolvedPreviewTheme = $derived(
    previewTheme ?? ($useDarkMode ? 'dark' : 'light'),
  );
  const previewPath = $derived(
    resolve(
      `/render?content=${encodeURIComponent(templatedContent)}&theme=${resolvedPreviewTheme}&overrideTheme=${overrideTheme}&inline=${inline}`,
      {},
    ),
  );
</script>

<section
  class={twMerge(
    inline ? 'inline-flex max-w-full' : fill ? 'h-full w-full' : 'w-full',
    className,
  )}
>
  <iframe
    bind:this={iframe}
    onload={resizeIframe}
    {title}
    class={inline ? 'block border-0 align-middle' : 'block w-full border-0'}
    src={previewPath}
    id={frameId}
  ></iframe>
</section>
