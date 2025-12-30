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
  }

  let { content, class: className = '', overrideTheme = '' }: Props = $props();

  let iframe: HTMLIFrameElement | null = $state(null);

  const resizeIframe = () => {
    if (!iframe) return;
    const minHeight = 100;
    const height = Math.max(
      iframe.contentWindow.document.body.scrollHeight + 2,
      minHeight,
    );
    iframe.height = '';
    iframe.height = height + 'px';
  };

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
  const previewTheme = $derived($useDarkMode ? 'dark' : 'light');
  const previewPath = $derived(
    resolve(
      `/render?content=${encodeURIComponent(templatedContent)}&theme=${previewTheme}&overrideTheme=${overrideTheme}`,
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
  ></iframe>
</section>
