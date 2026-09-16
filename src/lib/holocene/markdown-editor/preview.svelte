<script lang="ts">
  import { tick } from 'svelte';
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
    /** Size the host frame to its content without changing render styles. */
    fitContent?: boolean;
    frameId?: string;
    minHeight?: number;
    previewTheme?: 'dark' | 'light';
    /**
     * Render without the page padding or block margins, so a short string
     * sits naturally beside surrounding text instead of in a padded box.
     * The content still wraps, so it suits a label or a summary of a sentence
     * or two rather than a document.
     */
    compact?: boolean;
    /**
     * Accessible name for the frame. Name what the content is, so a frame in
     * a list of them is distinguishable.
     */
    title?: string;
  }

  let {
    content,
    class: className = '',
    fill = true,
    fitContent = false,
    overrideTheme = '',
    frameId = '',
    minHeight = 100,
    previewTheme,
    compact = false,
    title = 'output',
  }: Props = $props();

  let iframe: HTMLIFrameElement | null = $state(null);
  let iframeWidth = 0;
  let loading = $state(true);

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
    const main = iframeDocument.querySelector<HTMLElement>('main');
    const view = iframeDocument.defaultView;
    const bodyStyles = view?.getComputedStyle(body);
    const horizontalBodyPadding =
      parsePixels(bodyStyles?.paddingLeft) +
      parsePixels(bodyStyles?.paddingRight);

    if (!main) {
      return Math.ceil(
        Math.max(body.scrollWidth, body.getBoundingClientRect().width),
      );
    }

    const previousWidth = main.style.width;
    main.style.width = 'max-content';
    const contentWidth =
      Math.max(main.scrollWidth, main.getBoundingClientRect().width) +
      horizontalBodyPadding;
    main.style.width = previousWidth;

    return Math.ceil(contentWidth);
  };

  const resizeIframe = () => {
    if (!iframe) return;
    const iframeDocument = iframe.contentDocument;
    if (!iframeDocument) return;

    if (fitContent) {
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

  const handleLoad = async () => {
    if (fitContent) {
      loading = false;
      // Flush the loading styles before measuring the rendered document.
      await tick();
    }

    resizeIframe();
  };

  $effect(() => {
    if (!iframe || fitContent || typeof ResizeObserver === 'undefined') return;

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
      `/render?content=${encodeURIComponent(templatedContent)}&theme=${resolvedPreviewTheme}&overrideTheme=${overrideTheme}&compact=${compact}`,
      {},
    ),
  );

  $effect.pre(() => {
    if (fitContent && previewPath) loading = true;
  });
</script>

<section
  class={twMerge(
    fitContent ? 'inline-flex shrink-0' : fill ? 'h-full w-full' : 'w-full',
    className,
  )}
>
  <iframe
    bind:this={iframe}
    onload={handleLoad}
    {title}
    class={twMerge(
      fitContent
        ? 'block shrink-0 border-0 align-middle'
        : 'block w-full border-0',
      fitContent && loading && 'invisible !h-0 !w-0',
    )}
    src={previewPath}
    id={frameId}
  ></iframe>
</section>
