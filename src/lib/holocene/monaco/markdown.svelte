<script lang="ts">
  import { fade } from 'svelte/transition';

  import { page } from '$app/stores';

  import { useDarkMode } from '$lib/utilities/dark-mode';

  export let content: string;

  let iframe;

  $: theme = $useDarkMode ? 'dark' : 'light';

  const resizeIframe = () => {
    if (!iframe) return;
    iframe.height = '';
    iframe.height = iframe.contentWindow.document.body.scrollHeight + 2 + 'px';
  };

  const { workflow: workflowId, run: runId, namespace } = $page.params;

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

  const templatedContent = replaceTemplate(content);
</script>

<section class="h-full w-full" in:fade={{ duration: 1000 }}>
  {#key theme}
    <iframe
      bind:this={iframe}
      on:load={resizeIframe}
      title="output"
      src="/render?content={encodeURIComponent(templatedContent)}&theme={theme}"
      class="w-full rounded-md"
    ></iframe>
  {/key}
</section>
