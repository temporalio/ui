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
    frameId?: string;
    previewTheme?: 'dark' | 'light';
  }

  let {
    content,
    class: className = '',
    overrideTheme = '',
    frameId = '',
    previewTheme,
  }: Props = $props();

  let iframe: HTMLIFrameElement | null = $state(null);
  let iframeWidth = 0;

  const resizeIframe = () => {
    if (!iframe) return;
    const iframeDocument = iframe.contentDocument;
    if (!iframeDocument) return;

    const minHeight = 100;
    iframe.height = '0';
    iframe.style.height = '0px';

    const height = Math.max(
      iframeDocument.documentElement.scrollHeight,
      iframeDocument.body.scrollHeight,
      minHeight,
    );
    iframe.height = `${height + 2}`;
    iframe.style.height = `${height + 2}px`;
  };

  $effect(() => {
    if (!iframe || typeof ResizeObserver === 'undefined') return;

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
      `/render?content=${encodeURIComponent(templatedContent)}&theme=${resolvedPreviewTheme}&overrideTheme=${overrideTheme}`,
      {},
    ),
  );
</script>

<section class={twMerge('h-full w-full', className)}>
  <iframe
    bind:this={iframe}
    onload={resizeIframe}
    title="output"
    class="w-full"
    src={previewPath}
    id={frameId}
  ></iframe>
</section>
